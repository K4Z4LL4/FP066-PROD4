import { URL, fileURLToPath } from 'url';
import { dirname } from 'path';
function uploadHandler(req, res) {
    console.log('Request received at /upload', req.files, req.method);

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.json({ status: "error", text: "No se han cargado archivos." });
    }
    const taskFile = req.files.taskFile;
    const uploadUrl = dirname(import.meta.url) + '/../public/upload/' + taskFile.name;
    console.log("THE uploadURL:", uploadUrl);
    const uploadPath = fileURLToPath(uploadUrl);
    console.log("THE uploadPath:", uploadPath);

    const path = '/upload/' + taskFile.name;

    // Use the mv() method to place the file somewhere on your server
    taskFile.mv(uploadPath, function (err) {
        if (err) {
            console.log("Error al cargar archivo", err);
            return res.status(500).send(err);
        }
        res.json({ status: "ok", text: "File uploaded!", path });
    });
}
export default uploadHandler;