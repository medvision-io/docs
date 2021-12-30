---
title: "Setting up Local Model API"
date: "2021-12-30T17:19:51.246Z"
docVersion: x
description: How to setup local model API for data inference?
category: model-api
isTop: true
---

## Quickstart

```shell
git clone https://github.com/zhiva-ai/Lung-Segmentation-API.git

docker-compose up
```

## Requirements

Before we start please make sure your server has access to:

- Unix-base shell
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Get the server code

You can either clone this repo
```shell
git clone https://github.com/zhiva-ai/Lung-Segmentation-API.git
```
or download it directly from
[zhiva.ai Local Model API](https://github.com/zhiva-ai/Lung-Segmentation-API/archive/refs/heads/main.zip).

## Build the server

```shell
docker-compose up
```

Your model API should be available at:
```shell
localhost:8011
```

If you want to run the server on different port then modify `posts` mapping inside `docker-compose.yaml`.

## Use my own model

Model API receives an array of instances. Each instance is encoded as array of bytes and parsed into DICOM Instance with [pydicom](https://pydicom.github.io/) library.

This happens at [L41 endpoint definition](https://github.com/zhiva-ai/Lung-Segmentation-API/blob/main/app/endpoints/pacs_endpoint.py#L41). You don't have to worry about handling DICOM data. It is covered by [model-proxy](/latest/setting-up-model-proxy) and your API gets prepared data directly.

### Inference point

Your model should receive a list of DICOM SOP Instances. and the example implementation is available here:
[https://github.com/zhiva-ai/Lung-Segmentation-API/blob/5a3863bc587f956cf6920e8a466b3bbc16983c2d/app/segmentation/lungs_segmentation_inference.py#L39](https://github.com/zhiva-ai/Lung-Segmentation-API/blob/5a3863bc587f956cf6920e8a466b3bbc16983c2d/app/segmentation/lungs_segmentation_inference.py#L39).

If you have your own model then replace the invocation at [L58 of endpoint definition](https://github.com/zhiva-ai/Lung-Segmentation-API/blob/main/app/endpoints/pacs_endpoint.py#L58) with it.
