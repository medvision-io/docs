---
title: "Managing servers inside the DICOM viewer"
date: "2021-12-17T11:19:51.246Z"
docVersion: x
description: How to add newly creates server to DICOM viewer and use it as a data provider?
category: dicom-server
isTop: true
---

## Accessing server settings

To access server settings select `Settings` option form the main navigation and make sure `Servers` tab is selected:

![Server nav link](./server-settings-nav.png)

## Selecting sever

Usually you should have a list of servers defined by your organization and available without setting them manually. Chose one by selecting it from the `Selected Server` dropdown.

![List of servers](./list-of-servers.png)

After that confirm your choice by clicking on `Save Settings` button (bottom right of the page). Now in the `DICOMs` section, all study data should be loaded from selected PACS.

## Adding new server to the viewer.

> This guide assumes you already have a server that is available and secured with TSL. If you don't please follow the instructions to [Setup your Local PACS server](/latest/setting-up-local-pacs).

When the list is not complete, and you want to add your server to it just click the `Create New Server` button (bottom left of the page). That should create empty form for you to edit:

![New server form](./new-server-form.png)

As you can see, this server is not on the list and is not a valid server yet. You have to enter required fields and `Save Settings` at the end.

### List of fields:
- `Server Name` - Just a display name, visible on the list of servers
- `Server URL` - Valid URL to the DICOM server. This path should be compatible with DICOMWeb standard and has to start with `https://`. If you're using our local server then it will look like `https://localhost/zhiva/pacs` or `https://192.168.1.2/zhiva/pacs` if the server is not on your local machine.
- `Server Postfix` - Any string that is part of the server url. Usually empty but some of the servers have additional postfix like `https://server.mydomain.com/pacs/DCM4CHEE` where `DCM4CHEE` is a `postfix`.
- `WADO URI Postfix` - Another postfix in case the `WADO` (_Web Access DIICOM Objects_) protocol requires it. Usually `wado`.
- `WADO Postfix` - If there is additional postfix after `WADO URI` then put it here. Often the value `rs` (_Request/Response_) is used but some servers doesn't have that requirement.
- `QIDO Postfix` - Postfix for QIDO (_Query based on ID for DICOM Objects_) protocol. Works the same as other postfixes. Often `rs` but some servers leave it empty.
- `QIDO Supports Include Field` - Whether QIDO supports `Include Fields` option. It is used to retrieve additional metadata when requesting list of studies/series.
- `Image rendering protocol` - Prefix for retrieving image data from the server. Usually it's `wadors` or `wado` but might be `https`.
- `Thumbnail rendering protocol` - Prefix for retrieving thumbnail data from the server. Usually it's `wadors` or `wado` but might be `https`. Most of the servers use the same value as for `Image rendering protocol` but if you have extra thumbnail server this value might differ.
- `Enable Study LazyLoad` - Do not load the whole study at once. Only load selected series (speeds up loading)
- `Supports Fuzzy Matching` - Does server supports _Fuzzy Matching_ when searching for Studies? ([Our Local Server](/latest/setting-up-local-pacs) does)

### zhiva.ai Local Server Setup

We've created predefined server settings for [Our Local Server](/latest/setting-up-local-pacs). It is available under `Local Server` option. You might want to modify the `Server URL` to accommodate your local network settings. If you running the server on your local machine then leave `localhost` as hostname. If the server is somewhere in your network then change `localhost` to servers' IP address (sth. like `192.168.x.x`).

If you've changed other settings that affect the URL change them as well in the setting.