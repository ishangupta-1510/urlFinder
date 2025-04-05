import mongoose from "mongoose";

const urlSchema = new mongoose.Schema({
    originalUrl: {
        type: String,
        required: true
    },
    productUrl: {
        type: Array,
        required: true
    }
})

const Url = mongoose.model('Url', urlSchema);
export default Url;
export type UrlType = {
    originalUrl: string;
    productUrl: string[];
}