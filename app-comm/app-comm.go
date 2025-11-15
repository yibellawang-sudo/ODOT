package main

import (
	"bufio"
	"encoding/binary"
	"encoding/json"
	"io"
	"log"
	"os"
	"time"
)

// read in messages
type NativeHostManifest struct {
	Name           string   `json:"name"`
	Description    string   `json:"description"`
	Path           string   `json:"path"`
	Type           string   `json:"type"`
	AllowedOrigins []string `json:"allowed_origins"`
}

type localMsg struct {
	Time time.Time `json:"time"`
	Type string    `json:"type"`
}

func main() {

	//read in messages
	path := "~/Library/Application Support/Google/Chrome/NativeMessagingHosts/com.hackclub.odot.json"

	manifest := NativeHostManifest{
		Name:        "com.hackclub.odot",
		Description: "Odot",
		Path:        "~/Library/Application Support/Google/Chrome/NativeMessagingHosts/com.hackclub.odot.json",
		Type:        "stdio",
		AllowedOrigins: []string{
			"chrome-extension://knldjmfmopnpolahpmmgbagdohdnhkik/",
		},
	}
	if _, err := os.Stat(path); err != nil {
		if os.IsNotExist(err) {
			jsonBytes, _ := json.Marshal(manifest)
			os.WriteFile(path, jsonBytes, os.FileMode(os.O_RDWR))
		} else {
			log.Fatal(err)
		}

	}

	//first let the extension know we're ready to communicate
	jsonBytes, _ := json.Marshal(localMsg{Time: time.Now(), Type: "generic"})
	lengthBytes := make([]byte, 4)
	binary.LittleEndian.PutUint32(lengthBytes, uint32(len(jsonBytes)))
	os.Stdout.Write(lengthBytes)
	os.Stdout.Write(jsonBytes)

	//now read in the messages
	r := bufio.NewReader(os.Stdin)
	io.ReadFull(r, lengthBytes) //blocks until four bytes have been written in
	msgLen := binary.LittleEndian.Uint32(lengthBytes)
	msgBytes := make([]byte, msgLen)
	_, err := io.ReadFull(r, msgBytes)
	if err != nil {
		log.Fatal(err)
		return
	}

	// Parse JSON
	var msg map[string]interface{}
	err = json.Unmarshal(msgBytes, &msg)
	if err != nil {
		log.Fatal(err)
		return
	}

	//now send over data to electron app
	//through file rn

	os.WriteFile("~/coding/ODOT/odot/data.json", msgBytes, os.FileMode(os.O_RDWR))

}
