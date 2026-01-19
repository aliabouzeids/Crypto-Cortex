
let connectedAccount = null;

export default function handler(req, res) {
  if (req.method === "POST") {
    connectedAccount = req.body.account;
    return res.status(200).json({ ok: true });
  }
  if (req.method === "GET") {
    return res.status(200).json({ account: connectedAccount });
  }
}