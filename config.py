from urllib.parse import quote_plus
from flask import Flask, request
import mysql.connector

class Config:
    SECRET_KEY = 'your_secret_key_here'
    # SQLALCHEMY_DATABASE_URI = 'mysql+mysqlconnector://admin:9pL36BANZTRvIE3AnoK8@database-1.czxq6mw9gzbe.us-east-2.rds.amazonaws.com:3306/sports-performance-pro-db'
    SQLALCHEMY_DATABASE_URI = 'mysql+mysqlconnector://root:%s@localhost/sports-performance-pro-db' % quote_plus("macbookPro@2022")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
