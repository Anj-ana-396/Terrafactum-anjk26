
# Terrafactum
Terrafactum is an AI-powered environmental news summarizer and fact-checking web application that helps users understand climate and environmental articles more effectively. The application generates concise summaries and evaluates major claims within articles using large language models, providing a clear assessment of their credibility.

#
<img width="1920" height="1146" alt="Screenshot (137)" src="https://github.com/user-attachments/assets/74bb50d7-90e2-490e-8c95-501039868192" />


## Features
- AI-powered environmental article summarization
- Automatic extraction of key claims
- Claim credibility classification:
  - Well Supported
  - Questionable
  - Potentially Misleading
- Overall article credibility assessment
- Color-coded visual claim cards
- Responsive and modern user interface
- Secure API key storage using browser local storage



## Demo Video
### Watch the project demonstration here:
[Terrafactum Demo Video](https://vimeo.com/1166829761?share=copy&fl=sv&fe=ci#t=0)


## Installation
### Clone the Repository

```bash
git clone https://github.com/Anj-ana-396/Terrafactum-anjk26
cd Terrafactum-anjk26
```

### Install Dependencies

```bash
npm install
```

### Start Development Server

```bash
npm run dev
```

## How It Works
1. Article Input
Users paste an environmental or climate-related article into the input field.

2. AI Summarization
The article is sent to the Groq AI model, which generates a concise summary of the content.

3. Claim Extraction
The AI identifies important factual claims within the article.

4. Fact Checking
Each claim is analyzed and classified as:
- Well Supported
- Questionable
- Potentially Misleading

5. Result Presentation
The application displays:
- Summary section
- Claim cards
- Credibility labels
- Overall conclusion



## License
This project is licensed under the MIT License.
Feel free to use, modify, and distribute this project for educational or commercial purposes.
