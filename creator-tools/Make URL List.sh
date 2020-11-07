read -p "Enter url: " url
# printf "\n"

read -p "What sytem are these roms for in all caps e.g. NDS, NGC, NX, GBA: " system
printf "\n"

read -p "Enter file extensions of files without the dot e.g rar: " url
# printf "\n"


wget -U "eye01" -R "index.html*" $url --spider --no-parent --no-remove-listing -r 2>&1 | grep '^--' | awk '{ print $3 }' | grep -v '\.\(txt\)$' > out/urls.txt

node format $system

rm out/urls.txt