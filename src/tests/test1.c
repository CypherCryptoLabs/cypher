#include <stdio.h>
#include <sys/socket.h>
#include <arpa/inet.h>
#include <unistd.h>
#include <string.h>
#include <time.h>
#include <stdbool.h>
#define PORT 50000
   
int main(int argc, char const *argv[])
{

    printf("[i] connecting to node...\n");

    int sock = 0, valread;
    struct sockaddr_in serv_addr;
    char *blockchain_name = "Cypher Blockchain";
    char buffer[20269] = {0};
    if ((sock = socket(AF_INET, SOCK_STREAM, 0)) < 0)
    {
        printf("[!] Socket creation error \n");
        return -1;
    }
   
    serv_addr.sin_family = AF_INET;
    serv_addr.sin_port = htons(PORT);
       
    // Convert IPv4 and IPv6 addresses from text to binary form
    if(inet_pton(AF_INET, "127.0.0.1", &serv_addr.sin_addr)<=0) 
    {
        printf("[!] Invalid address/ Address not supported \n");
        return -1;
    }
   
    if (connect(sock, (struct sockaddr *)&serv_addr, sizeof(serv_addr)) < 0)
    {
        printf("[!] Connection Failed \n");
        return -1;
    }
    send(sock , blockchain_name , strlen(blockchain_name) , 0 );
    printf("[i] Blockchain Name sent\n");
    valread = read( sock , buffer, 1024);
    printf("[i] Node answered '%s'\n",buffer );

    if(strcmp(blockchain_name, buffer) == 0) {

        char packet[20268] = {0};
        int offset = 0;
        char input_buffer[10000] = {0};
        int query_id = 0;

        printf("Enter Query ID (1/2): ");
        scanf("%d", &query_id);
        getchar();
        packet[offset] = query_id;
        offset++;
        offset += 10;

        memset(input_buffer, 0, 10000);

        printf("Enter Sender Address: ");
        fgets(packet + offset, 132, stdin);
        if(packet[offset] == '\n') {
            packet[offset] = 0x00;
        }
        offset += 128;

        printf("Enter Receiver Address: ");
        fgets(packet + offset, 132, stdin);
        if(packet[offset] == '\n') {
            packet[offset] = 0x00;
        }
        offset += 128;

        printf("Enter Content for data_blob: ");
        fgets(packet + offset, 10240, stdin);
        
        bool new_line_byte_replaced = false;
        for (int i = 0; i < 10240 && !new_line_byte_replaced; i++) {
            if(packet[offset + i] == '\x0A') {
                packet[offset + i] = '\x0';
                new_line_byte_replaced = true;
            }
        }

        offset += strnlen(packet + offset, 10240) + 1;

        printf("Enter timestamp (leave empty to use current timestamp): ");
        fgets(input_buffer, 13, stdin);

        if(input_buffer[0] == '\n') {
            char timestamp_as_string[11];
            unsigned int timestamp = (unsigned int)time(NULL);
            sprintf(timestamp_as_string, "%d", timestamp);

            memcpy(packet + 1, timestamp_as_string, 10);
        } else {
            memcpy(packet + 1, input_buffer, 10);
        }

        send(sock , packet , offset , 0 );

        for(int i = 0; i < 20268; i++) {
            printf("%02X", packet[i]);
        }
        printf("\n");

    } else {

        printf("[!] Ending communication: node sent wrong Blockchain Name!");

    }

    memset(buffer, 0, 20269);
    read(sock, buffer, 20269);
    
    for(int i = 0; i < 20269; i++) {
        printf("%02x", buffer[i]);
    }
    printf("\n");

    return 0;
}