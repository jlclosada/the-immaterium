import os
import psycopg2
from decouple import config

def list_dbs():
    try:
        print(f"Connecting to list DBs...")
        conn = psycopg2.connect(
            dbname='postgres',
            user='admin',
            password='FHOXtztxjlvVkZQmG8Z6cwiOLr42r1Jo',
            host='dpg-d675mga48b3s73c2vmig-a.frankfurt-postgres.render.com',
            port='5432'
        )
        
        cur = conn.cursor()
        cur.execute("SELECT datname FROM pg_database WHERE datistemplate = false;")
        rows = cur.fetchall()
        print("Databases found:")
        for row in rows:
            print(f"- {row[0]}")
            
        cur.close()
        conn.close()
        
    except Exception as e:
        print(f"Listing DBs failed: {e}")

if __name__ == "__main__":
    list_dbs()
