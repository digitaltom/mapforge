#!/bin/bash

for file in *.png; do
    filename_without_prefix="${file#emoji_u}"
    filename_without_extension="${filename_without_prefix%.*}"
    
    # change depending on emoji filenames
    IFS='_' read -ra parts <<< "$filename_without_extension"
    
    new_filename=""
    for part in "${parts[@]}"; do
        echo "Working on $part"
        char=$(printf "\\U$part")
        new_filename+="$char"
    done
    
    echo "$char"
    new_filename+=".png"
    
    cp "$file" "$new_filename"
done

