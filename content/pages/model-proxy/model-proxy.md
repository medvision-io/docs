---
title: "Setting up Model Proxy"
date: "2021-12-30T19:19:51.246Z"
docVersion: x
description: How to setup model proxy server that handles communication between PACS server, DICOM Viewer and Model API?
category: model-api
isTop: true
---

## TLDR:

If you didn't get your TSL certificate file execute [Generate local TSL](/latest/setting-up-local-pacs#generate-local-tsl-certificate-only-once-every-365-days) first.

```shell
git clone https://github.com/zhiva-ai/model-proxy-example.git

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
git clone https://github.com/zhiva-ai/model-proxy-example.git
```
or download it directly from
[zhiva.ai PACS server](https://github.com/zhiva-ai/model-proxy-example/archive/refs/heads/main.zip).

## Local PACS and Model API

To use model proxy you have to get something that proxy could use. There are two main objects handled by proxy server. 

The first one is __Model API__ ([setup here](/latest/setting-up-local-model-api)). Model API is responsible for inferences, and it is the whole reason the proxy exists. You have to define your model APIs as described in [models.json](#modelsjson-add-model-api) section.

The second one is __PACS Server__ ([setup here](/latest/setting-up-local-pacs)). Server is required to extract DICOM data for the Model APIs. It has to be server that supports DICOMWeb standard. You have to define your server as described in [servers.json](#serversjson-add-dicomweb-server) section.

## Setup your local server

Before you start make sure you [Generate local TSL](/latest/setting-up-local-pacs#generate-local-tsl-certificate-only-once-every-365-days).

At this point you should have 1 `.crt` files and 1 `.key` file. Check this by calling

```shell
 ls *.{crt,key}
```

from your main directory. It should return following result `zhiva.crt  zhiva.key`.

### Build the server

```shell
docker-compose up
```

You proxy server should be available at `https://localhost:8002`. 

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

and look for the setting with the `inet` value that starts with `192.168.`. That should by your address in the local network. You should be able to access the server from `192.168.x.x:8002`.

## servers.json (add DICOMweb server)

path:
`./servers.json`

Keeps all definitions of available pacs servers. It has to be a valid dicomweb server. Each sever has to use uuidv4 which will be used to access it. You can generate such an uuid from [online generator](https://www.uuidgenerator.net/version4).

```javascript
{
  [{uuidv4}]: {
    "uri": string ("https://valid.server.uri/to/dicomweb"),
    "isDefault": boolean (default false)
  }
}
```

- `uri` - URI of dicomweb server
- `isDefault` - boolean which indicates the default server used when request doesn't specify the `uuidv4` value. __One server should have this set to `true`.__

## models.json (add model API)

path: `./models.json`

Stores all definitions of inference models. Each model might be available for different type of task. Each model has to use uuidv4 which will be used to access it. You can generate such an uuid from [online generator](https://www.uuidgenerator.net/version4).

```javascript
{
  [{uuidv4}]: {
    "uri": string ("https://valid.model.uri/to/inference"),
    "task": string ("segmentation" | "annotation" | "prediction"),
    "supports": Array<string> (list of supported paths, eg. ["/studies/series"])
  }
}
```

- `uri` - URI of the inference model API (eg. `http://localhost:8011/predict`)
- `task` - Task which model performs (one of `segmentation` | `annotation` | `prediction`)
- `supports` - List of available paths that model supports:
```shell
/studies
/studies/series
/studies/series/instances
```
