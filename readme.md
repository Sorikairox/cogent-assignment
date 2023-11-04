# Description

My name is Thomas Cruveilher. This repository is my submission for an assignment given by Cogent Labs during their recruitment process.

# Summary

- [Code Architecture](#code-architecture)
- [System Architecture](#system-architecture)
- [Architecture discussion/thoughts](#architecture-discussionthoughts)
- [Installation](#installation)
- [Improvements](#improvements-arbitrary-order)


# Code Architecture

Folder and code architectures are made with Clean/Hexa/Onion architecture in mind. As the 3 revolve around the same principles with separated layers. 

Here, we have domain and adapter directories.

## Primary Adapters

Primary adapters are where we get inputs from. This could be UI if the project needs one, but in our case, it consists of two HTTP servers, `worker` and `api`.

Their only purpose is to get inputs from users/consumers and send them to the service/business layer from the `domain`.

Each primary adapter directory is dependent on the framework used. I chose to use Nest.

### Api

This server receives HTTP requests to:
- trigger thumbnail's creation job
- get job status
- get all job list
- get thumbnail file

It communicates with the worker by using `JobSender` implementation. The current one is webhook/http based so it sends a POST request to worker.

This whole part need to be replaced with a OpenAPI/Swagger page.
#### Thumbnail creation

Example request (to run in your favorite http client, mine is embedeed in jetbrain, vscode has this extension to do so : [https://marketplace.visualstudio.com/items?itemName=humao.rest-client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client))

File path is assuming you  are running it from the project's root directoy.

```http request
POST http://localhost:4242/thumbnail/create
Content-Type: multipart/form-data; boundary=WebAppBoundary

--WebAppBoundary
Content-Disposition: form-data; name="file"; filename="cat-200-200"

< ./domain/picture/spec/fixture-200-200
--WebAppBoundary--
```

Returns job information

```json
{
  "type": "thumbnail",
  "data": {
    "name": "cat-200-200"
  },
  "id": "57a61121-2383-40c0-9943-eb7fae462685"
}
```


#### Get one job status

Example request
```http request
GET http://localhost:4242/job/57a61121-2383-40c0-9943-eb7fae462685
Accept: application/json

```

Returns job information

```json
{
  "id": "57a61121-2383-40c0-9943-eb7fae462685",
  "status": "success",
  "lastChangeDate": "2023-11-04T02:28:03.925Z",
  "type": "thumbnail"
}
```


#### Get all job statuses

Example request
```http request
GET http://localhost:4242/job/
Accept: application/json

```

Returns jobs information

```json
[
  {
    "id": "5db69565-db75-456b-ae26-d2d52c3c0f12",
    "type": "thumbnail",
    "status": "success",
    "lastChangeDate": "2023-11-04T02:26:04.227Z"
  },
  {
    "id": "57a61121-2383-40c0-9943-eb7fae462685",
    "type": "thumbnail",
    "status": "success",
    "lastChangeDate": "2023-11-04T02:28:03.925Z"
  }
]
```

#### Get thumbnail by sourcefile name

Example request
```http request
GET http://localhost:4242/thumbnail/fixture-200-200
Accept: application/json

```

Returns image with Content-Type: application/octet-stream

### Worker

This server receives HTTP request to execute jobs. Iit contains only one endpoint that will be called by the API.

```http request
POST http://localhost:4343/job/execute
Content-Type: application/json

{
  "type": "thumbnail",
  "id": "cool-id-2",
  "data": {
  "name": "fixture-200-200"
  }
}
```
Always send back "ok" and will store job status.

## Secondary Adapters

Secondary adapters are "output" of the business/domain logic. Think about storage such as filesystem, s3 buckets or database and outward communication to external API via http request, message in queue, websocket etc.

They are implementation of interfaces from the domain, so the folder architecture is similar.

In Memory/Filesystem adapters are used by the domain during unit test, so they do not have the own test.

Other adapters using SQL for example have their own integration test  (described below).

### Job Event Store

Store Job Event data somewhere.

Implementation:
- In Memory
- SQL using TypeORM

Other possible implementations: 
- SQL with another framework
- Any other database type

### Job Sender

Send job data where necessary.

Implementation:
- In Memory
- HTTP request (webhook style)

Other possible implementations:
- Add message in message queu (AMQP, MTTQ)
- Websocket

### Picture Store

Store picture data. 

Implementation: 
- Filesystem

Other possible implementations:
- Bucket in cloud providers

### Thumbnail generation strategy

Generate thumbnail from source image.

Implementation: 
- Using `image-thumbnail` library

Other possible implementations:
- Any other library
- External API

## Domain

Domain everything that is related to the business need, the "what are we doing" part.
Looking at `service.ts` methods should answer this question.

Here are the actual features:

- save source image
- create thumbnail from source image
- create a job
- get a job status
- get all job status
- execute a job with a given strategy

All domains features are unit tested by using in memory/filesystem adapters. This allows nearly instant feedback, and thus TDD.

# System architecture

Deployed system has 4 components:

- API to be accessed freely
- Worker which is triggered by API via webhook
- Postgres Database for job events storage
- A shared volume to store/access thumbnail/source image

Jobs are not stored in database "as-is" and updated to reflect their status.

In place of that, it's an event sourced system where we store events related to jobs such job created, job is running, job has error, job succeeded.
Few benefits is ease monitoring and stats creation.

# Architecture discussion/thoughts

## Hexa/Clean/Onion architecture, or folder's hell ?

I think that this architecture comes with a high cognitive load for developers with no experience with it.

However, anybody can learn to work, and I believe that in the long run, such architecture with no coupling, thanks to abstraction, in par with cohesive team discipline (TDD for example) drastically increase maintainability and flexibility (such as moving from one db provider to another, or one framework to another).

## Webhook vs Queue

I chose to use a webhook based worker for simplicity/speed sake. However, this fast implementation comes with some trade-offs. The lack of retry mechanism or pressure handling (which kinda depends on the former).

## NestJS ?

I love this framework for the following reason:

- Typescript first
- Opinionated Clean/Hexa/Onion architecture
- Dependency injection system
- Can generate/host OpenAPI/Swagger documentation from code
- Can be used for HTTP API, Websocket server, Worker (handling many queues engine), Standalone apps
- Huge ecosystem
- Awesome documentation
- Overall DX

But it comes with a learning curve, like everything.

## Thumbnail generation strategy

I chose `image-thumbnail` because its installation is easy.

Potentially more performant library all requires MagickImage cli to be installed before hand.

## SQL database

Cogent labs using a SQL database, looked like the obvious choice.

Also, Event-Sourcing requires auto-increment ID.

# Installation

## Pre-requisite

- Node v20.9.0
- Yarn 1.22.19
- Docker. Tested with v20.10.6
- Docker compose. Tested with v1.19.1

## Install dependencies

This project uses yarn workspace, simply `yarn` this at the project root folder.

## Run API + Worker + DB + Shared volumes

```shell
docker compose up
```

Will spawn all components.

API is accessible via port 4242

## Testing

We have 3 testing strategies, unit, integration and e2e. All can be ran from the root folder.

**Integration and e2e requires a running DB (use `docker compose up`)**

### Unit

This strategy test the business logic/domain code by using in memory/filesystem secondary adapters. They are fast, and intended to always be running with file watching while you are programming. 

```shell
yarn test
```

```shell
yarn test:watch
```

### Integration

This strategy makes sure that we correctly implemented the external dependencies, such as the SQL database, in our secondary adapters.

**Requires a running DB (use `docker compose up`)**

```shell
yarn test:integration
```

```shell
yarn test:integration:watch
```

### End to end (e2e)

This strategy make sure that we integrated everything correctly in  our primary adapters API and Worker.

They are "end-to-end" relative to each adapter context. They are not tests from the end user/consumer perspective with all systems running.

For example, API tests call all API endpoints, and ensure that we get the expected response, but does not check that the worker did what it has to do.

**Requires a running DB (use `docker compose up`)**

```shell
yarn test:e2e
```

# Improvements (arbitrary order)

## Features:
- Retry mechanism for webhook delivery
- Add reasons on error when getting job(s) status
- Snapshots to offload processing
- Pagination on get job (cannot be done efficiently without snapshots)
- Handle image extensions
- Setup OpenAPI/Swagger documentation
- Handle all non optimistic edge cases such as when images/jobs do not exist, or external providers fails.

## Codewise:
- Improve Job data and JobEvent data attributes, probably with generic
- Harmonise linters between domain and adapters (prettier is used in Nest applications)
- Run "real" e2e test with containers running, and api really calling the worker
- Add readme in domain and adapters folders

## Security
-  Prevent access to worker's endpoint from outside (only other pod should be able to access it)
