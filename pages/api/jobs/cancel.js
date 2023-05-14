import db from '../../../database'

function getStatusOfJobId(job_id){
    return new Promise((resolve, reject) => {
        const sql = `SELECT job_status FROM jobs WHERE job_id = ?`
        db.get(sql, [job_id], (err, row) => {
            if(err){
                console.log(err)
                reject(err)
            }else{
                resolve(row)
            }
        })
    })
}

function updateJobStatusToCanceled(job_id){
    return new Promise((resolve, reject) => {
        const sql = `UPDATE jobs SET job_status = 'Canceled' WHERE job_id = ?`
        db.run(sql, [job_id], (err) => {
            if(err){
                console.log(err)
                reject(err)
            }else{
                resolve()
            }
        })
    })
}

export default function handler(req, res) {
    if(req.method === 'POST'){
        const { job_id } = req.body

        getStatusOfJobId(job_id).then(async (row) => {
            if(row === undefined){
                res.status(404).json({message: "Job Not Found"})
            }else if(row.job_status === 'Waiting'){
                updateJobStatusToCanceled(job_id).then(() => {
                    res.status(200).json({ status: 'Canceled'})
                })
            }else{
                res.status(200).json({ status: row.job_status})
            }
            return
        }).catch((err) => {
            console.log(err)
            res.status(500).json({message: "Internal Server Error : " + err.message})
        })
    }else{
        res.status(405).json({message: "Method Not Allowed"})
    }
}