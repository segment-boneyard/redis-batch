redis-batch
===========

Redis Batch wraps a [node_redis](https://github.com/mranney/node_redis) instance, and batches calls to hincrby, incrby and sadd. You can configure the time between flushes. The default time between flushes is 5 seconds.

## Usage

```javascript
var RedisBatch = require('redis-batch');

var redisBatch = new RedisBatch(redis); // redis instance created elsewhere
var redisBatch = new RedisBatch(redis, { flushAfter: 3000 });

/**
 * hincrby batches by key:field
 * This will become a single "hincrby warehouse pants -6" when sent to redis.
 */

redisBatch.hincrby('warehouse', 'pants', -2)
    .hincrby('warehouse', 'pants', -1)
    .hincrby('warehouse', 'pants', -3);

/**
 * incrby batches by key
 * This will become a single "incrby projectcounter 22" when sent to redis.
 */

redisBatch.incrby('projectcounter', 12)
    .incrby('projectcounter', 6)
    .incrby('projectcounter', 4);

/**
 * sadd batches by setkey
 * This will become a single "sadd mysetkey key1 key2 key3" when sent to redis.
 */

redisBatch.sadd('mysetkey', 'key1')
    .sadd('mysetkey', 'key2')
    .sadd('mysetkey', 'key3');
```

You can intermingle sadd, incrby and hincrby as you desire.

## License (MIT)

```
WWWWWW||WWWWWW
 W W W||W W W
      ||
    ( OO )__________
     /  |           \
    /o o|    MIT     \
    \___/||_||__||_|| *
         || ||  || ||
        _||_|| _||_||
       (__|__|(__|__|
```

Copyright (c) 2013 Segment.io Inc. <friends@segment.io>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
