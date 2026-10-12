import assert from 'node:assert/strict';
import {listedTopics} from './subject-navigation-lib.mjs';

assert.deepEqual(listedTopics('\\li{[专题](outline)：[定义](definition)}'), ['outline']);
assert.deepEqual(listedTopics('\\li{\\strong{[专题](outline)}：[定义](definition)}'), ['outline']);
assert.deepEqual(listedTopics('\\li{\n[专题](outline)\n[定义](definition)\n}'), ['outline']);
assert.deepEqual(listedTopics('\\p{[前言](intro)}\n\\li{[甲](first)}\n\\li{[乙](second)}'), ['first', 'second']);
assert.deepEqual(listedTopics('\\li{暂未收录独立专题}'), []);
console.log('Subject navigation: 5 topic-link regression cases passed.');
