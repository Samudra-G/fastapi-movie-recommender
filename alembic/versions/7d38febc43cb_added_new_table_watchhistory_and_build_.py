"""added new table watchhistory and build rel w/ user & movie

Revision ID: 7d38febc43cb
Revises: 473a5c9bb2b4
Create Date: 2025-03-03 09:39:37.856612

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7d38febc43cb'
down_revision: Union[str, None] = '473a5c9bb2b4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    pass
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    pass
    # ### end Alembic commands ###
