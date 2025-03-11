#!/usr/bin/env python
# coding: utf-8

# # BERT Model Fine-Tuning

# ### Load packages

# In[1]:


import torch
from transformers import BertTokenizerFast, BertModel, BertForSequenceClassification
from torch.utils.data import DataLoader
from torch.optim import AdamW
from transformers import get_scheduler
from tqdm import tqdm


# In[2]:


from google.colab import files
uploaded = files.upload()


# ### Loading Datasets

# In[3]:


import pandas as pd
train_df = pd.read_csv("imdb_train.csv")
test_df = pd.read_csv("imdb_test.csv")


# ### Tokenize IMDb dataset

# In[4]:


tokenizer = BertTokenizerFast.from_pretrained("bert-base-uncased")


# In[5]:


def tokenize_data(texts, labels, max_length=512):
    return tokenizer(texts.tolist(),
                     padding="max_length",
                     truncation=True,
                     max_length=max_length,
                     return_tensors="pt"), labels


# In[6]:


train_encodings, train_labels = tokenize_data(train_df["text"], train_df["label"])
test_encodings, test_labels = tokenize_data(test_df["text"], test_df["label"])


# ### Pytorch Dataset

# In[7]:


class IMDbDataset(torch.utils.data.Dataset):
    def __init__(self, encondings, labels):
        self.encodings = encondings
        self.labels = labels

    def __len__(self):
        return len(self.labels)

    def __getitem__(self, idx):
        return {
            "input_ids": self.encodings["input_ids"][idx],
            "attention_mask": self.encodings["attention_mask"][idx],
            "labels": torch.tensor(self.labels[idx], dtype=torch.long),
        }


# In[8]:


train_dataset = IMDbDataset(train_encodings, train_labels)
test_dataset = IMDbDataset(test_encodings, test_labels)


# ### Dataloaders for Batching

# In[9]:


batch_size = 8

train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
test_loader = DataLoader(test_dataset, batch_size=batch_size, shuffle=False)


# ### Fine-Tuning BERT

# In[10]:


model = BertForSequenceClassification.from_pretrained("bert-base-uncased", num_labels=2) #for binary classification: pos & neg
optimizer = AdamW(model.parameters(), lr=5e-5, eps=1e-8)

num_training_steps = len(train_loader) * 3
lr_scheduler = get_scheduler("linear", optimizer=optimizer, num_warmup_steps=0, num_training_steps=num_training_steps)


# In[11]:


print("GPU Available:", torch.cuda.is_available())
print("GPU Name:", torch.cuda.get_device_name(0) if torch.cuda.is_available() else "None")


# In[12]:


device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)


# In[14]:


epochs = 3
for epoch in range(epochs):
    model.train()
    loop = tqdm(train_loader, leave=True)

    for batch in loop:
        input_ids = batch["input_ids"].to(device)
        attention_mask = batch["attention_mask"].to(device)
        labels = batch["labels"].to(device)

        # Forward pass
        outputs = model(input_ids, attention_mask=attention_mask, labels=labels)
        loss = outputs.loss
        logits = outputs.logits

        # Backpropagation
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()
        lr_scheduler.step()

        # Update progress bar
        loop.set_description(f"Epoch {epoch+1}")
        loop.set_postfix(loss=loss.item())


# In[15]:


model.save_pretrained("bert-imdb-model")
tokenizer.save_pretrained("bert-imdb-tokenizer")


# In[16]:


get_ipython().system('ls -l bert-imdb-tokenizer')


# In[17]:


import shutil
shutil.make_archive("bert-imdb-tokenizer", 'zip', "bert-imdb-tokenizer")


# In[18]:


files.download("bert-imdb-tokenizer.zip")


# In[ ]:




