const path = require('path')
const fs = require('fs')

// 상수 정의
const PORT = 3001

const express = require('express')
const app = express()

app.listen(PORT, () => {
    console.log(`server is running on ${PORT}`)
})

// API를 정의합니다.

app.use('/', express.static('./public'))