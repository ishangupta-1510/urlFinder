"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controller_1 = require("../controller");
const router = (0, express_1.Router)();
router.get('/', (req, res) => {
    res.send('Healthy, Express!');
});
router.post('/crawler', controller_1.crawler);
exports.default = router;
