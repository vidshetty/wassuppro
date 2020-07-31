self.addEventListener('push',e => {
    var obj = e.data.json();
    console.log(obj);
    if(obj.type == "text"){
        var title = `${obj.title} (${obj.body.length} new messages)`;
        var completemsg = "";
        for(var i=0;i<obj.body.length;i++){
            completemsg += `${obj.body[i]}\n`;
        }
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
            e.notification.close();
            clients.openWindow("https://wassuppro.herokuapp.com");
        }
        else if(e.action == "close"){}
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
});