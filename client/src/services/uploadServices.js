export async function uploadImageToCloudinary(file) {
    const cloudName = "datmsosje";
    const uploadPreset = "wedding";

    const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    try {
        const res = await fetch(url, {
            method: "POST",
            body: formData,
        });

        const data = await res.json();
        console.log("Cloudinary response:", data);
        if (data.secure_url) {
            return data.secure_url;
        } else {
            throw new Error("Upload thất bại: " + JSON.stringify(data));
        }
    } catch (err) {
        console.error("Upload error:", err);
        throw err;
    }
}