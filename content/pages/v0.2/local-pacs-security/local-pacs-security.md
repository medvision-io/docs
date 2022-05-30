---
title: "Local PACS Security"
date: "2022-05-27T01:19:51.246Z"
docVersion: ">=0.2.x"
description: How to setup local server to store DICOM files and use it as a data provider for the app?
category: dicom-server
isTop: true
---

This guide goes through security options that are available for our local PACS server. It is advised to create different roles for different types of users and restrict some actions (like `DELETE`) to administrator.

## Requirements

- Setup of [Our Local PACS](/latest/setting-up-local-pacs)

## Enable Basic Authentication

```javascript
  "RemoteAccessAllowed": true,
  "RemoteAccessEnabled": true,
  [...]
  "AuthenticationEnabled": true,
```

## User Accounts

Basic user accounts are defines within `/orthanc.json` file inside our Local PACS server project. You can define your users by adding them to `RegisteredUsers` like:

```javascript
  "RegisteredUsers": {
    "zhiva": "3$yc$XYQhSA55bJf"
  },
```

You can add as many users as you want, but we advise to add at least 3 different user roles (__admin__, __editor__, __viewer__).

```javascript
  "RegisteredUsers": {
    "zhiva-admin": "Gf3hDbjY6HkdDsRh",
    "zhiva-editor": "oAm5Ns78DsdE6MNy",
    "zhiva": "3$yc$XYQhSA55bJf"
  },
```

These are only example users. You can create more than one user per role (e.g. have one editor user per radiologist).

## Set your user credentials inside application



## Allow admin for local orthanc viewer

To manage your local PACS you have to define server access in DicomWeb config. Usually you want to have admin access to your data locally, so you should add that account as default account for authentication.

```javascript
  "DicomWeb": {
    [...]
    "Servers" : {
      "zhiva" : [ "http://localhost:8042/pacs/", "zhiva-admin", "Gf3hDbjY6HkdDsRh" ]
    }
  },
```

## Define roles and access

There are 3 possible roles in local PACS:
- __admin__
- __editor__
- __viewer__

When authentication is enabled you have to define which user has particular role. Roles are stored in `./scripts/IncomingHttpRequestFilter.lua` file.

```javascript
local viewers = {'zhiva', 'zhiva-editor'}
local editors = {'zhiva-editor'}
local admins = {'zhiva-admin'}
```

You can assign user to more than one role. When assigning to admin role (`admins`), user automatically get permission to every action possible. __You should never give the admin permission to untrusted users__. Other two roles can be assigned separately. You can create editor (`editors`) without `read` access (this can be used for devices that only store data into PACS). _Editor_ can update and create data. Delete action is available only for _Admin_. _Viewer_ is a basic role and safe to use for most of the users. This should be your default account for your users.

Enter user credentials in [Authentication](/latest/managing-servers-inside-the-dicom-viewer/#authentication) section in your server settings.

## Example setup

Let us create an example accounts for your users. We're going to have one __admin_ account, three __editor_ accounts for radiologists who are working on developing ML models, and one __viewer__ account (to use by everyone else).

#### Setup accounts

Go to `/orthanc.json` and find `RegisteredUsers` property. We have to add all users to this list:

```javascript
  "RegisteredUsers": {
    "zhiva-admin": "Gf3hDbjY6HkdDsRh",
    "radiologist-one": "ptrioBBQcKMnz5$j",
    "radiologist-two": "PtxdcgMErs5ab?F4",
    "radiologist-three": "4&QDTDJ$!cE8xdYJ",
    "radiology": "3$yc$XYQhSA55bJf"
  },
```

#### Set permissions for your users

Now we have to open `./scripts/IncomingHttpRequestFilter.lua` and modify list of users assigned to particular roles:

```javascript
local viewers = {'radiology', 'radiologist-one', 'radiologist-two', 'radiologist-three'}
local editors = {'radiologist-one', 'radiologist-two', 'radiologist-three'}
local admins = {'zhiva-admin'}
```

#### Set credentials inside application

Every user has to enter credentials into the application. Let's assume you're one of the radiologists and got your credentials (`"radiologist-one": "ptrioBBQcKMnz5$j"`). Go to [Application Setting Authentication](/latest/managing-servers-inside-the-dicom-viewer#authentication) and set __Server Login__ and __Server Password__. Because your account has __editor__ permission you should also check __Can Store/Update Data?__

![Can Save button](./can-save-button.png)

This is important because it allows you to write data back to the PACS (e.g. segmentation).

Now let's do the same for default __viewer__ account (`radiology`). This account could be used as a default account for inference but does not require to store the data on the server. As in the previous example, you should enter your credentials (`"radiology": "3$yc$XYQhSA55bJf"`) to __Server Login__ and __Server Password__. This time you leave __Can Store/Update Data?__ box __unchecked__.

> Nothing will happen if you leave __Can Store/Update Data?__ checked for a user without __editor__ permission. This permission is checked on the server either way. This checkbox is there only for disabling save buttons so the user won't get request error message when trying to store data on PACS.
