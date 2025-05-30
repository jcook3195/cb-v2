#!/bin/bash

echo "Getting started..."

helpFunction()
{
    echo "Help"
}

while getopts "b:l:" opt
do
    case "$opt" in
        b ) bee="$OPTARG" ;;
        l ) LOGGING_PROPERTIES="$OPTARG" ;;
        ? ) helpFunction ;;
    esac
done

HOST=`cat $LOGGING_PROPERTIES | grep hostname | cut -d'=' -f2`
PORT=`cat $LOGGING_PROPERTIES | grep port | cut -d'=' -f2`

# echo "B: $bee"
echo "LOGGING: $LOGGING_PROPERTIES"
echo "HOST: $HOST"
echo "PORT: $PORT"

