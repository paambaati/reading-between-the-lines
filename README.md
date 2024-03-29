# reading-between-the-lines

[![Build Status](https://github.com/paambaati/reading-between-the-lines/workflows/PR%20Checks/badge.svg)](https://actions-badge.atrox.dev/paambaati/reading-between-the-lines/goto) [![Test Coverage](https://api.codeclimate.com/v1/badges/fb77b0efca00f8789f5a/test_coverage)](https://codeclimate.com/github/paambaati/reading-between-the-lines/test_coverage) [![Maintainability](https://api.codeclimate.com/v1/badges/fb77b0efca00f8789f5a/maintainability)](https://codeclimate.com/github/paambaati/reading-between-the-lines/maintainability) [![WTFPL License](https://img.shields.io/badge/License-WTFPL-blue.svg)](LICENSE)

A simple API server that lets users access and add meter readings.

The API also extrapolates meter readings to guesstimate the end-of-month cumulative readings.

<small> 📣 Note that this project was purpose-built for a coding challenge (see [problem statement](PROBLEM-STATEMENT.md)).</small>

### 🛠️ Setup

```bash
git clone https://github.com/paambaati/reading-between-the-lines
cd reading-between-the-lines

yarn install
yarn build
```

#### 👩🏻‍💻 Usage
```bash
yarn start
```

For debugging in watch-mode with additional logs, use —

```bash
yarn debug
```

#### 🧪 Tests & Coverage
```bash
yarn run coverage
```

### 🚀 Postman
Once the API is up, import the [`api.postman_collection.json`](https://raw.githubusercontent.com/paambaati/reading-between-the-lines/master/api.postman_collection.json) file in Postman to test the APIs.
