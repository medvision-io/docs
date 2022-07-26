This is a documentation for _zhiva.ai_ products. Feel free to read the whole thing but here is a:

# Quickstart

If you want to setup everything for your local research please execute following steps:

### 1. Setup Local PACS server

You have to have something that servers the __DICOM__ data. Usually this is a __PACS server__ with __DICOMWeb__. Setting local server is easy and everything you should do is described in [Setting up Local PACS](/latest/setting-up-local-pacs). If your server deals with multiple users you should consider [Setting up PACS with JWT](/latest/setting-up-local-pacs-with-jwt). This version of PACS gives you ability to easily create multiple users with limited access to the server.

### 2. Add Local PACS server to application settings

After creating Local PACS you have to [Add that server to the application](/latest/managing-servers-inside-the-dicom-viewer) so you can use its data.

### 3. Setup your AI Model server

Now you have to have something that makes inferences. If you have your own model (or want to use ours) please follow the instruction: [Setting up Local Model API](/latest/setting-up-local-model-api)

### 4. Setup proxy server for your AI Model

When you have a model you cannot just connect it directly to the application. You have to __add data providers__ (PACS servers) to it. Reason for that is that sending DICOM data directly from an application is extremely inefficient. How to setup a proxy server is described in [Setting up Model Proxy](/latest/setting-up-model-proxy)

### 5. Add your models to application settings

At the end you have to add your models that are now accessible through [Model Proxy](/latest/setting-up-model-proxy) to application. Please follow [Managing AI Models inside the DICOM viewer](/latest/managing-ai-models-inside-the-dicom-viewer) guide.

### 6. Setup your user accounts (optional but advised)

#### For [Basic Local PACS](/latest/setting-up-local-pacs)

Usually you're dealing with more than one account. Some of them should have write permission and some of them are only for viewing data. [Example setup](/latest/local-pacs-security/#example-setup) explains how to set accounts for different users in your local environment.

#### For [Local PACS with JWT](/latest/setting-up-local-pacs-with-jwt)

If you're using PACS with Tokens you're usually dealing with mode users. Every user should have its own account created by Administrator as described in [User account](/latest/setting-up-local-pacs-with-jwt#user-accounts) section.

### 7. You're good to go

Your architecture should look like this:

![local architecture](/local_architecture.png)