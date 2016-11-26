import peewee
from peewee import *

db = MySQLDatabase('cubing', user='root',passwd='wca')

class Team(peewee.Model):
    id = CharField()
    owner = IntegerField()
    name = TextField()

    class Meta:
        database = db


