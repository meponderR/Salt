#!/bin/bash
wget -U "eye01" -R "index.html*" $1 --spider --no-parent --no-remove-listing -r 2>&1 | grep '^--' | awk '{ print $3 }' | grep -v '\.\(txt\)$' > out/urls.txt
