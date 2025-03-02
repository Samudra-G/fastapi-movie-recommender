"""Updated embedding schema to VECTOR

Revision ID: 3cf2606c1637
Revises: 07462114996a
Create Date: 2025-03-02 11:52:08.146417

"""
from typing import Sequence, Union
from pgvector.sqlalchemy import VECTOR
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3cf2606c1637'
down_revision: Union[str, None] = '07462114996a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Convert movies.embedding column
    op.execute("ALTER TABLE movies ALTER COLUMN embedding TYPE VECTOR(768) USING embedding::VECTOR(768);")
    
    # Convert posters.embedding column
    op.execute("ALTER TABLE posters ALTER COLUMN embedding TYPE VECTOR(768) USING embedding::VECTOR(768);")

    # ### end Alembic commands ###


def downgrade() -> None:
    # Revert posters.embedding column back to TEXT
    op.execute("ALTER TABLE posters ALTER COLUMN embedding TYPE TEXT USING embedding::TEXT;")

    # Revert movies.embedding column back to TEXT
    op.execute("ALTER TABLE movies ALTER COLUMN embedding TYPE TEXT USING embedding::TEXT;")
    # ### end Alembic commands ###
