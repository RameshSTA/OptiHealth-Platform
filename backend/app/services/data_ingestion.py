import pandas as pd
from sqlalchemy.orm import Session
from app.db.session import engine
from app.models.patient import Patient
import time

def ingest_csv_to_db(file_path: str):
    """
    Reads a large CSV in chunks and bulk inserts into PostgreSQL.
    """
    CHUNK_SIZE = 50000
    total_rows = 0
    start_time = time.time()

    print(f"Starting ingestion of {file_path}...")

    # Iterate over the CSV in chunks
    for chunk in pd.read_csv(file_path, chunksize=CHUNK_SIZE):
        
        # Rename columns to match SQLAlchemy model if necessary
        # Ensure column names in CSV match: id, name, age, etc.
        chunk.rename(columns={
            'sys_bp': 'sys_bp',
            'dia_bp': 'dia_bp', 
            # Add mappings if CSV headers differ from DB columns
        }, inplace=True)

        # Basic Cleaning
        chunk.fillna(0, inplace=True)
        
        # Add timestamp
        chunk['created_at'] = pd.Timestamp.now()

        # Bulk Insert using pandas to_sql (efficient method)
        chunk.to_sql('patients', engine, if_exists='append', index=False, method='multi')
        
        total_rows += len(chunk)
        print(f"Processed {total_rows} rows...")

    duration = time.time() - start_time
    return {
        "status": "success", 
        "total_rows": total_rows, 
        "duration_seconds": round(duration, 2)
    }