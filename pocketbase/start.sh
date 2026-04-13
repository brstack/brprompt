#!/bin/bash
cd "$(dirname "$0")"
./pocketbase serve --dev --http=127.0.0.1:8090
