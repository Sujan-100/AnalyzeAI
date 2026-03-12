import google.generativeai as genai


def ask_gemini(prompt):
    """
    Sends a prompt to the Gemini model and returns the text response.
    This function is used by the context-aware chatbot in app.py.
    """
    try:
        model = genai.GenerativeModel("models/gemini-2.5-pro")
        
        # Use the simple content generation that is known to work 
        # for your specific SDK environment.
        response = model.generate_content(contents=prompt) 
        
        return response.text
    except Exception as e:
        # Return a clear error message if the API call fails
        return f"Chatbot Error: Failed to get response from Gemini. Details: {str(e)}"