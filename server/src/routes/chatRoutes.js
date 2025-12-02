import ChatBoxController from "../controllers/ChatBoxController.js";

const chatRoutes = (app) => {
    app.get("/chats", ChatBoxController.getChatBox);
    app.post("/chats", ChatBoxController.sendMessage);
};

export default chatRoutes;
