from unidecode import unidecode

from templates import guidance

DOC_AUDIT_PROMPT_WITH_FILES = """### Document Audit Instructions
You are an expert business and information technology chatbot with knowledge of the Australian Government writing standards as defined in the style guide. You will be provided with a document by the User that should be compared against the style guide.  Using Australian English language that is compliant with the style guide rules give a full list of all the differences from the style guide found in the User’s document and make sure you provide an updated document with any differences highlighted. Be as accurate and complete and factual as possible.

### Style Guide Text
This is the style guide: <rdti-template>

### Additional File Context
This is the user document that should be compared against the style guide: <additional-context>

### User input
<user-input>"""

DOC_AUDIT_CHAT_PROMPT_WITH_FILES = """### Document Audit Instructions
You are an expert business and information technology chatbot with knowledge of the Australian Government writing standards as defined in your previous update recommendations. You will be provided with a document by the User that should be updated based on your previous update recommendations.  Using Australian English language that is compliant with the style guide rules provide an updated document that follows your recommendations. Be as accurate and complete and factual as possible.

### Previous Update Recommendations
This is your previous update recommendations: <previous-recommendations>

### Additional File Context
This is the user document that should be compared against the style guide: <additional-context>

### User input
<user-input>"""

CHAT_PROMPT_WITH_FILES = """### Document Analysis Instructions
You are an expert business and information technology chatbot. You will be provided with information about a company or an information technology solution. This information may or may not be relevant. Answer user questions as accurately and factually as possible.

### Main Template Text
<rdti-template>

### Additional File Context
<additional-context>

### User input
<user-input>"""

CHAT_PROMPT_WITHOUT = """### Document Analysis Instructions
You are an expert business and information technology chatbot. Answer user questions as accurately and factually as possible.

### User input
<user-input>
"""

# <core-activity-name>, <examples>, <rdti-template>, <additional-context>
EXPERIMENTS_PROMPT = f"""### R&D Report Writing Instructions
You are an expert R&D tax consultant. You will be provided with information about a company who might be eligible for R&D tax credits. This information may or may not be relevant. You need to describe experiments that this company conduct to prove hypothesis of core activity called: <core-activity-name>. Keep it detailed and factual and make sure to stick to information found in Main Template and additional files provided and avoid making assumptions.

### Main Template Text
<rdti-template>

### Additional File Context
<additional-context>

### Output Format
Give two sections for each experiment. First section called 'Experiment <experiment number>:' should be a description of an experiment that explains the rationale behind technological or methodological choices and second section call 'Observations <experiment number>:' would give observations about the procedure and define technical challenges and specific failures. Describe the experiments in terms of “systematic “testing”, “a series of systematic “trialling”, or “experimental development”. Clearly state section heading and number experiment and observation sections accordingly. Each section heading should be followed by a newline. Also follow these guidelines: {unidecode(guidance['Core_activity_1'][0][7])} {unidecode(guidance['Core_activity_1'][1][7])}.

### Output Language and Style
Maintain a technical and scientific lexicon appropriate to the field throughout the document. Avoid commercial language, replacing it with field-specific terms, technologies, and methodologies.
Generic/commercial terms must be replaced with specific, technical language. Specific examples include: "systematic" instead of "iterative", "user" for "client" (unless technically specified), "logic" for "code", "unify" for "integrate", "programming interface" for "API", and "further develop" in place of "optimize", "improve", or "enhance".
Where possible, use industry-specific terminology such as "scalable", "optimal performance", "efficiency", "innovative", and "intelligent" within the appropriate contexts.
You will use <citation-needed> in place of any citations to papers.

### Task instructions
Your main task is to describe experiments that this company conduct to prove hypothesis of core activity called: <core-activity-name>. Keep it detailed and factual and make sure to stick to information found in Main Template and additional files provided and avoid making assumptions. You will ensure you include every valid experiment & observation highlighted in the input files.

### User comments
Here are additional comments and requests from the user that you should follow:

<user-comments>

Start this section with: In FY"""

# <core-activity-name>, <examples>, <rdti-template>, <additional-context>, <experiments-output>
EVALUATIONS_PROMPT = f"""### R&D Report Writing Instructions
You are an expert R&D tax consultant. You will be provided with information about a company who might be eligible for R&D tax credits. This information may or may not be relevant. You need to write precise evaluations of experiments based on the presence of corresponding observations for core activity called: <core-activity-name>. Keep it detailed and factual and make sure to stick to information found in Main Template and additional files provided and avoid making assumptions.

### Main Template Text
<rdti-template>

### Additional File Context
<additional-context>

### Experiments Written output
<experiments-output>

### Output Format
Write two paragraphs in each evaluation section. First need to describe experimental aims and second should present outcomes and findings. Start each section with a heading 'Evaluation' and then follow by a number that corresponds to the experiments it is evaluating. Also follow these guidelines: {unidecode(guidance['Core_activity_1'][0][8])} {unidecode(guidance['Core_activity_1'][1][8])}
You will use <citation-needed> in place of any citations to papers.

### Task instructions
Your main task is to write precise evaluation sections for each of the corresponding experiments for core activity called: <core-activity-name>. Start each section with a heading 'Evaluation' and then follow by a number that corresponds to the experiment. Keep it detailed and factual and make sure to stick to information found in Main Template and additional files provided and avoid making assumptions.

### User comments
Here are additional comments and requests from the user that you should follow:

<user-comments>"""

# <core-activity-name>, <rdti-template>, <additional-context>, <examples>
HYPOTHESIS_PROMPT = f"""### R&D Report Writing Instructions
You are an expert R&D tax consultant. You will be provided with information about a company who might be eligible for R&D tax credits. 
This information may or may not be relevant. You need to describe hypothesis of core activity called: <core-activity-name>. 
Give an overview of the proposed solution to problem being solved or opportunity being addressed. Focus on the technology itself rather than commercial benefits or business concerns. Keep it detailed and factual and make sure to stick to information found in Main Template and additional files provided and avoid making assumptions.

### Experiments Written output
Here are the experiments conducted to prove the hypothesis:
<experiments-output>

### Main Template Text
<rdti-template>

### Additional File Context
<additional-context>

### Output Format
Return hypothesis as a number of short paragraphs. Also follow these guidelines: {unidecode(guidance['Core_activity_1'][0][3])} {unidecode(guidance['Core_activity_1'][1][3])}.
You will use <citation-needed> in place of any citations to papers.

### Task instructions
Your main task is to describe hypothesis of core activity called: <core-activity-name> by giving an overview of proposed solution to problem being solved or opportunity being addressed. Keep it detailed and factual and make sure to stick to information found in Main Template and additional files provided and avoid making assumptions.

### User comments
Here are additional comments and requests from the user that you should follow:

<user-comments>
"""

# <supporting-activities>, <rdti-template>, <additional-context>, <core-activities-information>, <examples>
SUPPORTING_ACTIVITIES_PROMPT = f"""### R&D Report Writing Instructions
You are an expert R&D tax consultant. You will be provided with information about a company who might be eligible for R&D tax credits. This information may or may not be relevant. You need to describe the following list of supporting activities: <supporting-activities>. Keep it detailed and factual and make sure to stick to information found in Main Template and additional files provided and avoid making assumptions.

### Extracted Core Activities 
These are names, hypotheses and experiments of core activities from report so far: <core-activities-information>. 

### Main Template Text
<rdti-template>

### Additional File Context
<additional-context>

### Output Format
Put answers to questions in a Python list of lists between square brackets where each lists corresponds to the activity being described. First item should hold 
activity name, second item is the start date and third should be the end date. Fourth entry should outline how this supporting activity support research as a whole or a particular core activity. Fifth item in the list should describe supporting activity in bullet points.
Sixth item in the list should return the name of the core activity that current supporting activity support (all core activities is a valid answer). 
Also follow these guidelines: {[[unidecode(x) for x in guidance['Supporting_activities'][0]], [unidecode(x) for x in guidance['Supporting_activities'][1]]]}.
You will use <citation-needed> in place of any citations to papers.

### User comments
Here are additional comments and requests from the user that you should follow:

<user-comments>

### Task instructions
You will now write one list for each of the following supporting activities: <supporting-activities>. Return those lists as items in parsable Python list as well. Stick to information found in Main Template and additional files provided as well as core activities from the report so far and avoid making assumptions.
Make sure to return just a nested python list of lists, nothing else.
"""


# <n-core-activities>, <examples>. <rdti-template>, <additional-context>
OBJECTIVES_PROMPT = f"""### R&D Report Writing Instructions
You are an expert R&D tax consultant. You will be provided with information about a company who might be eligible for R&D tax credits. This information may or may not be relevant. You need to write a paragraph describing overall objectives of current project. Keep it detailed and factual and make sure to stick to information found in Main Template and additional files provided and avoid making assumptions. Output report has <n-core-activities> core activities.

### Main Template Text
<rdti-template>

### Additional File Context
<additional-context>

### Output Format
Return project objectives as a paragraph. Also follow these guidelines: {guidance['Objectives']}
You will use <citation-needed> in place of any citations to papers.

### Task instructions
Your main task is to write a paragraph describing overall objectives of current project. Keep it detailed and factual and make sure to stick to information found in Main Template and additional files provided and avoid making assumptions. Output report has <n-core-activities> core activities.

### User comments
Here are additional comments and requests from the user that you should follow:

<user-comments>
"""

# <core-activity-name>, <rdti-template>, <additional-context>, <examples>
CORE_INFO_PROMPT = f"""### R&D Report Writing Instructions
You are an expert R&D tax consultant. You will be provided with information about a company who might be eligible for R&D tax credits. This information may or may not be relevant. You need to extract start date, end date of core activity called: <core-activity-name>. Then describe newness of proposed solution compared to existing alternatives or substitutes available in the public sphere and return a summary of technical challenges faced that current knowledge does not address, and as a result, a competent professional in the field would be unable to know how to solve. Keep it detailed and factual and make sure to stick to information found in Main Template and additional files provided and avoid making assumptions.

### Main Template Text
<rdti-template>

### Additional File Context
<additional-context>

### Core activity hypothesis
Here is hypothesis for this core activity: <hypothesis-output>

### Output Format
Return a valid dictionary, using the format provided.

{{
    "startDate": start date of the activity,
    "endDate": end date of the activity,
    "newKnowledge": detailed explanation into what new knowledge was intended to produce,
    "challenges": what sources were investigated, what information was found, and explain why a competent professional could not have known or determined the outcome in advance,
    "conclusions": answer whether any conclusions have already been reached to support hypothesis
}}

You will use <citation-needed> in place of any citations to papers.
Also follow these guidelines: {unidecode(guidance['Core_activity_1'][0][1])} {unidecode(guidance['Core_activity_1'][1][1])}, {unidecode(guidance['Core_activity_1'][0][2])} {unidecode(guidance['Core_activity_1'][1][2])},{unidecode(guidance['Core_activity_1'][0][4])} {unidecode(guidance['Core_activity_1'][1][4])},{unidecode(guidance['Core_activity_1'][0][6])} {unidecode(guidance['Core_activity_1'][1][6])},{unidecode(guidance['Core_activity_1'][0][9])} {unidecode(guidance['Core_activity_1'][1][9])}

### Task instructions
Your main task is to extract start date, end date of core activity called: <core-activity-name>, describe newness of proposed solution and technical challenges currently faced. Keep it detailed and factual and make sure to stick to information found in Main Template and additional files provided and avoid making assumptions. Make sure to return your answers in a json as described above.

### User comments
Here are additional comments and requests from the user that you should follow:

<user-comments>

Start this section with: Here's the response json as described: """

ADD_COMMENTS_PROMPT = """### User comments
Here are additional comments and requests from the user that you should follow:
"""


summarization_prompt_rimon_specific = """You are going to complete two tasks at once: text filtering, and text compression.
You will be given a dump of raw text, which has been uploaded by an individual at a company who is looking to understand if their project is eligble for R&D tax credits.
Your task is to reduce down and extract ONLY the relevant text. They might upload things that are not relevant. Here are descriptions of the two things you will do simultaneously


### Text Compression 
Compress the given text to short expressions, and such that you can reconstruct it as close as possible to the original. 
I need you to comply with the 5 conditions below:

1. Remove ALL unimportant words.
2. Do not reorder the original words.
3. Do not change the original words.
4. Do not use abbreviations or emojis.
5. Do not add new words or symbols.

Compress the origin aggressively by removing words only. Compress the origin as short as you can, while retaining as much information as possible. 

### Text Filtering
You will only condense text which may be relevant to the output report that will be written for R&D tax credits. Here are details you should preserve:
-> information on dates of an eligble project starting
-> ALL information about the project or company 
-> anything related to objectives of the project
-> anything related to hypothesis, problems being solved, opportunities being addressed
-> any background on activities undertake by the company
-> any indication of research done or sources used to come to findings
-> highlights into how the company acquired new knowledge
-> highlights into how the company could not determine the outcome in advance
-> detailed descriptions of experiments, with experiment observation pairs 
-> details on the evaluation of results
-> details on conclusions reached

It is important to remember, that it may be that NONE of the text is relevant. Do not feel under any pressure to return things if nothing is relevant! Just return with "" in that case.
We need to preserve as many details as possible to write the final report, while also cutting down the amount of text we read (we will read your outputs, and use those to write the report)

<text-to-compress>

Aim for around 2000 characters in your response.

The compressed and filtered text, which could now be used as a detailed summary for the R&D tax report is is:"""

summarization_prompt_rimon_specific_new = """You will be given a dump of raw text, which has been uploaded by an individual at a company who is looking to understand if their project is eligble for R&D tax credits.
Your task is to reduce down and extract ONLY the relevant text, for writing an R&D tax credit report. They might upload things that are not relevant.

You will only return text which may be relevant to the output report that will be written for R&D tax credits. Here are details you should preserve:

-> information on dates of an eligble project starting
-> ALL information about the project or company 
-> anything related to objectives of the project
-> anything related to hypothesis, problems being solved, opportunities being addressed
-< anything to help write a section about what experiments the company conducted
-> any background on activities undertake by the company
-> any indication of research done or sources used to come to findings
-> highlights into how the company acquired new knowledge
-> highlights into how the company could not determine the outcome in advance
-> detailed descriptions of experiments, with experiment observation pairs 
-> details on the evaluation of results
-> details on conclusions reached

It is important to remember, that it may be that NONE of the text is relevant. Do not feel under any pressure to return things if nothing is relevant! Just return with "" in that case.
We need to preserve as many details as possible to write the final report, while also cutting down the amount of text we read (we will read your outputs, and use those to write the report)

<text-to-compress>

Aim for around 2000 characters in your response.

The compressed and filtered text, which could now be used as a summary of the input file for the purposes of writing the R&D tax report is is:"""

summarization_prompt_rimon_specific_json_style = """
You will be given a dump of raw text, which has been uploaded by an individual at a company who is looking to understand if their project is eligble for R&D tax credits.
Your task is to reduce down and extract ONLY the relevant text, for writing an R&D tax credit report. They might upload things that are not relevant.

You will details relevant to the output report that will be written for R&D tax credits. 


Here are details you may include:

DO NOT include the KEY of the dictionary IF there is NO QUOTE you can cite for it. I want you to quote the paragraphs used for each of the fields below.

{
    "dates": [{"date":, "dateInfo":}],
    "projectInfo":,
    "companyInfo":,
    "projectObjectives":,
    "hypothesis":,
    "problems":,
    "opportunities":,
    "experiments":,
    "activities:",
    "researchInfo":,
    "how_get_new_knowledge":,
    "experiments_evaluation": ,
    "observations_of_experiments":
}

It is important to remember, that it may be that NONE of the text is relevant. Do not feel under any pressure to return things if nothing is relevant! Just do not include the item in the json if that is the case.
We need to preserve as many details as possible to write the final report, while also cutting down the amount of text we read (we will read your outputs, and use those to write the report)

<text-to-compress>

The compressed and filtered text, which could now be used as a summary of the input file for the purposes of writing the R&D tax report is is:"""
