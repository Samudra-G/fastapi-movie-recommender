"""added ovr and stuff

Revision ID: 4cdcaa65b6c3
Revises: ed4254e99171
Create Date: 2025-03-13 12:46:47.063814

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4cdcaa65b6c3'
down_revision: Union[str, None] = 'ed4254e99171'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('movies', sa.Column('overview', sa.Text(), nullable=True))
    op.create_index(op.f('ix_reviews_source'), 'reviews', ['source'], unique=False)
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f('ix_reviews_source'), table_name='reviews')
    op.drop_column('movies', 'overview')
    # ### end Alembic commands ###
