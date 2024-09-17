import React from 'react';
import styled from 'styled-components';
import ReactMarkdown from 'react-markdown';
import Expander from '../components/ui/Expander';

const welcome = `
1.	Welcome to the SCOTi AI Sandbox for the Australian Govt StyleGuide review.
2.	This sandbox provides secure access to a set of beta version SCOTi AI agents. 
3.	The purpose is User experimentation; to consider “what might be possible” with a sovereign SCOTi AI workbench, or GenAI workshop or even an AI factory.

`

const sandbox = `
1.	This sandbox of beta SCOTi agents is not scaled-up or fully polished; unlike a dedicated Pilot or a production SCOTi AI agent deployment. 
2.	It is in a secure and robust environment running on the AWS Sydney Cloud.  But it has limits that (sometimes) mean it may necessary to re-start or scale-back your experiments. 
3.	SCOTi will generally tell you if something goes wrong.  When in doubt you can always just ask SCOTi if you have a question and a page reload will always get you re-started.

`

const health_warning = `
1.	Note this SCOTi AI sandbox site >> portal.scoti.au << is not an official Aust Govt website and it should be used accordingly.  
2.	If it is helpful, we can provision you with additional access credentials using an alternative, private email address, if preferred.  Please just send a Request, using the Feedback Tab in SCOTi and include your alternative private email address.  We will send you another onboarding email to the new address.

`

const tips = `
1.	Please keep input document within the current 500K char limit (~200-250 pages).  You may see an >  AxiosError < if things get too big.  Just reload the page and try a smaller file.
2.	Please avoid stress testing.  SCOTi is using lower cost GPU processors for the Sandbox (to keep the budget under control).  If it can’t keep up, you may see a message from SCOTi saying:  “Arghhh .. I’m taking too long to respond.  Please wait and try again later.”  If you see this message retry your request and also please use the Feedback tab to let us know what’s happening and we will try adjusting the GPU processor performance. 
3.	The sandbox has a series of portal tabs, each with a different Scoti AI Agent and tabs sharing information and collecting feedback.  Switching between SCOTi Agents will end the current Agent and start the new Agent in the new portal tab.  If you want to have two (or more) of the SCOTi Agents running in parallel, just open another copy of the >> portal.scoti.au << site in a separate browser tab and start the new SCOTi Agent.
4.	The DocAudit tab provides the SCOTi agent comparing a User uploaded document against a preloaded copy of the Australian Government Style Manual that has been screen scraped from the current website.  
a.	First, start by using the drop down above the Chat History, to select the sections of the Style Manual you want SCOTi to use in the audit.  If nothing is selected, SCOTi will use the whole Style Manual.  
b.	Second, upload a document in the sidebar (either drag and drop or upload from your desktop) for SCOTi to audit against the Style Manual.  When the document is loaded, a “running person icon” will be visible (in the bottom right of the screen) and SCOTi will automatically begin running through a series of audits against each selected part of the Style Manual.  
c.	Audit results and recommendations will be displayed in the Chat History window as they are generated.   
d.	When the Audit is complete the “running person icon” will stop. 
e.	In the sidebar a red button will become available to >> Download Doc Audit Session History <<.  Selecting this will download a full account of the Audit to the Users desktop.  
f.	A second radio button will also be available in the sidebar to >> Request updated document with recommendations applied.   <<.  Selecting this will re-start SCOTi and generate all the updated sections of the original document that now comply with SCOTi’s audit against the Style Manual and display them in the Chat History window.  
g.	To save a copy of the updated output, just select the >> Download Doc Audit Session History << button again. The history will include the updated document at the end.  
h.	To start again with a different document to audit, select the radio button in the sidebar to >> Clear Current Docs and Restart Chat <<.
5.	The DocAnalyst tab provides a SCOTi agent that allows Users to upload one or multiple documents (TXT, PDFs etc) and discuss them with SCOTi in the Chat History window.  Ask questions about the document(s), get a summary, ask about differences or topics, just about anything.
6.	The DocWriter tab provides a SCOTi agent that opens in a separate browser tab and in addition to standard document formatting and layout, allows the User to highlight a section of text and select the >> SCOTi Commands << drop down to expand, re-write, improve etc the original text.  This Agent is still being finalised and will also provide collaboration and an “Ask SCOTi” option that can be customised.
7.	The EntityAnalyst tab provides a SCOTi agent that opens in a separate browser tab.  It allows the User to upload a document, then specify (input or preselect) a set of (upto 12) Entity types to be searched for.  Running the >> Process Text <<, generates a copy of the uploaded document that is  marked-up with all the specified Entities.  Finally selecting the >> Generate Relation Graph << will kick-off a graph generation.  This is iteratively built and presented and becomes more detailed with each iteration.  At any time the user can selected >> Save Graph << and a standard format txt file with the entities will be downloaded to the User’s desktop.  These graph files can be saved and displayed at any time using the >> Entity Display << agent.
8.	The EntityDisplay tab provides a SCOTi example of the Entity Analyst and a graph viewing tool.  Graph files generated from the EntityAnalyst agent that have been saved, can be loaded into the sidebar and will display for review and sharing.  Double clicking on a entity node in the graph will simplify the display to just show that node and all its associated entities.  Double clicking anywhere on the screen will restore the original view.
9.	The Feedback tab provides a quick reliable way to provide any Comments, Questions, Anomalies & Feature Requests.  The inputs are automatically forwarded to our SCOTi team for review and email feedback will be provided. The feedback will also be part of a post-trial review of the Scoti sandbox experience.  
10.	The About tab provides an introduction to SCOTi including a outline of the sandbox architecture.  It also provides our Privacy commitment and Terms of Use for the sandbox.

`

const UserNotesContainer = styled.div`
  padding: 20px;
`;

const UserNotes: React.FC = () => (
  <UserNotesContainer>
    <Expander title={'Welcome'} initialyExpanded={true}>
      <ReactMarkdown>{welcome}</ReactMarkdown>
    </Expander>
    <Expander title={'Its a sandbox'} initialyExpanded={true}>
      <ReactMarkdown>{sandbox}</ReactMarkdown>
    </Expander>
    <Expander title={'There is a health warning'} initialyExpanded={true}>
      <ReactMarkdown>{health_warning}</ReactMarkdown>
    </Expander>
    <Expander title={'Some tips and tricks'} initialyExpanded={true}>
      <ReactMarkdown>{tips}</ReactMarkdown>
    </Expander>
  </UserNotesContainer>
);

export default UserNotes;