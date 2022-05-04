---
title: "Setting up Local PACS"
date: "2021-12-17T01:19:51.246Z"
docVersion: x
description: How to setup local server to store DICOM files and use it as a data provider for the app?
category: dicom-server
isTop: true
---

<h2>TLDR:</h2>

If you didn't get your TSL certificate file execute [Generate local TSL](/latest/setting-up-local-pacs#generate-local-tsl-certificate-only-once-every-365-days) first.

```shell
git clone https://github.com/zhiva-ai/pacs-server.git

docker-compose up
```

## Requirements

Before we start please make sure your server has access to:

- Unix-base shell
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [OpenSSL](https://www.openssl.org/)

## Get the server code

You can either clone this repo

```shell
git clone https://github.com/zhiva-ai/pacs-server.git
```

or download it directly from
[zhiva.ai PACS server](https://github.com/zhiva-ai/pacs-server/archive/refs/heads/main.zip).

## Generate local TSL certificate

(only once every 365 days)

> If you already have the `.crt` and `.key` files do not generate them again. Go straight to <a href="#build-the-server">Build the server section</a> and run your server with existing certificate.

Before we starty storing data on the server we have to secure the connection between the server and the viewer. We're going to use [Transport Layer Security (TSL)](https://en.wikipedia.org/wiki/Transport_Layer_Security). First, we have to generate certificate (`.crt`) and key (`.key`) files. Because we're doing it from the local server we're going to use [OpenSSL](https://www.openssl.org/) (we don't need external party to sign certificate, if you want to use it on the external server you should sign with something like [Let's Encrypt](https://letsencrypt.org/)).

To generate local certifiate please execute following command in the terminal window (make sure `openssl` is installed).

```shell
openssl req -x509 \
    -nodes -days 365 \
    -newkey rsa:2048 \
    -keyout zhiva.key \
    -out zhiva.crt \
    -subj "/C=PL/L=Wroclaw/O=Your Company, Inc./CN=localhost"
```

Change `-subj` to describe your organization:

- `C` - country code (2 letter code)
- `L` - location (city name)
- `O` - organization name
- `CN` - full domain name (use `localhost` for local servers)

Then copy `.crt` file as trusted certificate:

```shell
cat zhiva.crt > trusted.crt
```

## Setup your local server

At this point you should have 2 `.crt` files and 1 `.key` file. Check this by calling

```shell
 ls *.{crt,key}
```

from your main directory. It should return following result `trusted.crt zhiva.crt zhiva.key`.

If one of those files is missing go back to [Generate local TSL certificate](#generate-local-tsl-certificate-only-once-every-365-days) section and make sure you have all of them.

### Build the server

```shell
docker-compose up
```

After starting the server you should be able to access [localhost/zhiva/app/explorer.html#upload](https://localhost/zhiva/app/explorer.html#upload) where you can upload your files.

> You might be prompted with the message about invalid SSL certificate. This is caused by using OpenSSL to generate certificate for `localhost` and that certificate has no 3rd party that confirms its authenticity. It's fine for local network but remember to use proper certificate if the server is accessible from outside your network.

## Access from within internal network

If you have more than one computer inside your network (or VPN connection), then you can share the server settings with them. To check the server address please run the following command:

Linux or Mac:

```shell
ifconfig
```

Windows

```shell
ipconfig
```

and look for the setting with the `inet` value that starts with `192.168.`. That should by your address in the local network. You should be able to access the upload page from `https://192.168.x.x/zhiva/app/explorer.html`.

## Upload your DICOMs

Go to [localhost/zhiva/app/explorer.html#upload](https://localhost/zhiva/app/explorer.html#upload) and click on `Select files to upload`.

![Upload dicoms screenshot](./upload-dicoms.png)

After selecting all the DICOMs click `Start the upload` to store them on the server.

All DICOMs are stored in [Docker's persistent volume](https://docs.docker.com/storage/volumes/) so even after restarting the server all your files are still accessible.

Now you should be able to access studies which were generated after uploading DICOM files. List of studies is available at [https://localhost/zhiva/app/explorer.html#find-studies](https://localhost/zhiva/app/explorer.html#find-studies).

## FAQs

- _"How to use this server with your DICOM viewer?"_

Detailed instruction is described in [Managing servers inside the DICOM viewer](/latest/managing-servers-inside-the-dicom-viewer#zhivaai-local-server-setup) guide.

- _"Why my server doesn't accept very large DICOM files?"_

There is an maximum file size setting inside server config. If you want to change that please go to `./nginx.conf` and modify:

```nginx configuration
client_max_body_size 2000m;
```

## Authentication

### Basic Auth

To secure your local server you can use Basic Auth function that is built-in into Orthanc. To enable authentication simply change the value of `AuthenticationEnabled` to `true` inside `orthanc.json` configuration file.

With that change you can provide your username and password inside `RegisteredUsers` property:

```javascript
"RegisteredUsers": {
  "zhiva": "35&Q39Nj&i@Eyk6P"
},
```

You can create as many users as you need. It's a good practice to have at least 2 different users (one for the application and one for the server), but we encourage you to provide unique users per workstation.

To still being able to use DicomWeb with Orthanc you then have to provide that password in `DicomWeb` property inside `orthanc.json` file.

```javascript
"DicomWeb": {
    [...]
    "Servers" : {
      "zhiva" : [ "http://localhost:8042/pacs/", "zhiva", "35&Q39Nj&i@Eyk6P" ]
    },
    [...]
},
```

Remember to enter created credentials into the application settings and model proxy. To see how please read [Application Authentication](latest/managing-servers-inside-the-dicom-viewer#authentication) section for managing the App and [Model Proxy Authentication](latest/setting-up-model-proxy#authentication) for setting up PACS connection security inside the proxy.

## Customization

### URL

You're able to change server url by modifying two settings:

- `orthanc.json` - inner server settings
- `nginx.conf` - main server settings

Inside `orthanc.json` go to `DicomWeb` attribute and change `Root` property. This property is responsible for path to `dicom-web` server (the one used by the viewer).

```javascript
// orthanc.json
{
  "DicomWeb": {
    [...]
    "Root": "/pacs/"
    [...]
  }
}
```

If you want to change main path to your server you have to modify the second setting (`nginx.conf`). Path is defined as a location and rewrite (reverse-proxy). Change following lines

```javascript
// nginx.conf
[...]
    location /zhiva {
      [..]
      rewrite /zhiva(.*) $1 break;
    }
[..]
```

you can change it to:

```javascript
// nginx.conf
[...]
    location /serv {
      [..]
      rewrite /serv(.*) $1 break;
    }
[..]
```

and access your server at `https://localhost/serv/...`

### Storage

Currently, all the data are stored in [Docker's persistent volume](https://docs.docker.com/storage/volumes/). This is volume created by Docker itself. If you want to specify the path please follow the instruction from the [Docker Docs](https://docs.docker.com/compose/compose-file/compose-file-v3/#short-syntax-3) about setting up directories as volumes.
