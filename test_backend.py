import requests
import json

def test_analyze():
    url = "http://127.0.0.1:10000/analyze"
    
    # Path to a sample CSV in your data folder
    file_path = "backend/data/financials.csv" 
    
    data = {
        "task": "Analyze 5-year revenue growth",
        "competitors": "OpenAI, NVIDIA, Microsoft",
        "max_revisions": 2
    }

    try:
        with open(file_path, "rb") as f:
            files = {"file": ("financials.csv", f, "text/csv")}
            # We use stream=True because your backend uses StreamingResponse
            response = requests.post(url, data=data, files=files, stream=True)

        print(f"Status Code: {response.status_code}")
        
        for line in response.iter_lines():
            if line:
                decoded_line = line.decode('utf-8')
                if decoded_line.startswith("data: "):
                    # Clean the SSE prefix and parse JSON
                    json_str = decoded_line.replace("data: ", "")
                    event_data = json.loads(json_str)
                    
                    # Highlight which node is running
                    for node_name in event_data.keys():
                        print(f"✅ Node Completed: {node_name}")

    except Exception as e:
        print(f"❌ Test Failed: {e}")

if __name__ == "__main__":
    test_analyze()