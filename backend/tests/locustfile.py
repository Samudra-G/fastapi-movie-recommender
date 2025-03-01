from locust import HttpUser, task, between, TaskSet
from urllib.parse import urlencode
import os
from dotenv import load_dotenv

load_dotenv()

class UserBehavior(TaskSet):

    def on_start(self):
        payload = {
            "username": os.getenv("TEST_USERNAME"),
            "password": os.getenv("TEST_PASSWORD")
        }
        headers = {"Content-Type": "application/x-www-form-urlencoded"}

        response = self.client.post("/login", data=payload, headers=headers) 

        if response.status_code == 200:
            self.token = response.json().get("access_token")
            if not self.token:
                print("⚠️ Warning: Access token not found in response!")
        else:
            print(f"❌ Failed to obtain access token! Status: {response.status_code}, Response: {response.text}")


    @task(2)
    def get_movies(self):
        """ Fetch movies list """
        self.client.get("/movies")

    @task(1)
    def get_user_profile(self):
        """ Fetch the authenticated user's profile """
        if hasattr(self, "token") and self.token:
            headers = {"Authorization": f"Bearer {self.token}"}
            self.client.get("/users/me", headers=headers)
        else:
            print("Skipping /users/me due to missing token...")


class WebsiteUser(HttpUser):
    tasks = [UserBehavior]
    wait_time = lambda self: 1  