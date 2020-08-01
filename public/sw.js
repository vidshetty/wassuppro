self.addEventListener('push',e => {
    var obj = e.data.json();
    if(obj.type == "text"){
        if(obj.body.length == 1){
            var title = `${obj.title} (${obj.body.length} new message)`;
        }
        else{
            var title = `${obj.title} (${obj.body.length} new messages)`;
        }
        var completemsg = "";
        if(obj.body.length < 4){
            for(var i=0;i<obj.body.length;i++){
                if(i != (obj.body.length - 1)){
                    completemsg += `${obj.body[i]}\n`;
                }
                else{
                    completemsg += `${obj.body[i]}`;
                }
            }
        }
        else{
            var leng = obj.body.length;
            for(var i=3;i>=1;i--){
                if(i != 1){
                    completemsg += `${obj.body[leng-i]}\n`;
                }
                else{
                    completemsg += `${obj.body[leng-i]}`;
                }
            }
        }
        if(obj.streaming == "true"){
            var options = {
                body: `${completemsg}`,
                icon: "./icons8-hangouts-512.png",
                badge: "./icons8-hangouts-96.png",
                tag: "renotify",
                renotify: true,
                data: {
                    message: "text during call"
                },
                actions:[
                    {
                        action: "close",
                        title: "Dismiss"
                    }
                ]
            };
        }
        else{
            var options = {
                body: `${completemsg}`,
                icon: "./icons8-hangouts-512.png",
                badge: "./icons8-hangouts-96.png",
                tag: "renotify",
                renotify: true,
                data: {
                    message: "text"
                },
                actions:[
                    {
                        action: "reply",
                        title: "Reply"
                    },
                    {
                        action: "close",
                        title: "Dismiss"
                    }
                ]
            };
        }
        e.waitUntil(
            self.registration.showNotification(title, options)
        );
    }
    if(obj.type == "video"){
        var title = obj.title;
        var options = {
            body: `tried to video call you`,
            icon: "./icons8-hangouts-512.png",
            badge: "./icons8-hangouts-96.png",
            data: {
                message: "video"
            },
            actions:[
                {
                    action: "close",
                    title: "Dismiss"
                }
            ]
        };
        e.waitUntil(
            self.registration.showNotification(title, options)
        );
    }
});

self.addEventListener("notificationclick",e => {
    if(e.notification.data.message == "text"){
        if(e.action == "reply"){
            clients.openWindow("https://wassuppro.herokuapp.com");
        }
        else if(e.action == "close"){
            e.notification.close();
        }
        else{
            clients.openWindow("https://wassuppro.herokuapp.com");
        }
        e.notification.close();
    }
    if(e.notification.data.message == "video"){
        if(e.action == "close"){
            e.notification.close();
        }
        e.notification.close();
    }
    if(e.notification.data.message == "text during call"){
        if(e.action == "close"){
            e.notification.close();
        }
        e.notification.close();
    }
});