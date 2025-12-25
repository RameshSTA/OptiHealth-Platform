import sys
import os
import pandas as pd
import time
from sqlalchemy import create_engine, text

# 1. Setup path so we can import from 'app'
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.core.config import settings

DATA_FILE = os.path.join(os.path.dirname(__file__), '../data/million_patients.csv')

def seed_database():
    print(f" Starting Database Seed Process...")
    print(f" Reading data from: {DATA_FILE}")

    if not os.path.exists(DATA_FILE):
        print(f" Error: File not found. Run 'python scripts/generate_dataset.py' first.")
        return

    # 2. Connect to DB
    engine = create_engine(settings.DATABASE_URL)
    
    # 3. Process in Chunks (Efficient for 1M+ rows)
    chunk_size = 50000 
    total_rows = 0
    start_time = time.time()

    try:
        # Create an iterator to read the file in parts
        with pd.read_csv(DATA_FILE, chunksize=chunk_size) as reader:
            for i, chunk in enumerate(reader):
                
                # Cleaning: Handle missing values if any
                chunk = chunk.fillna(0)
                
                # Write to SQL (Append mode)
                chunk.to_sql(
                    'patients', 
                    con=engine, 
                    if_exists='append', # 'replace' on first run if you want to wipe old data
                    index=False,
                    method='multi'      # Much faster bulk insert
                )
                
                total_rows += len(chunk)
                elapsed = time.time() - start_time
                print(f"    Processed Chunk {i+1}: {total_rows} rows inserted ({elapsed:.2f}s)")

        print(f"\n SUCCESS! {total_rows} patient records loaded into PostgreSQL.")
        print(f"⏱ Total Time: {time.time() - start_time:.2f} seconds")

    except Exception as e:
        print(f"\n Error during seeding: {e}")

if __name__ == "__main__":
    seed_database()