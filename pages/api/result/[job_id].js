import db from '../../../database'

async function getTheStatusOfJob(id){
    return new Promise((resolve, reject) => {
        db.get(`SELECT job_status, solve_time FROM jobs WHERE job_id = ?`, [id], (err, row) => {
            if(err){
                reject(err)
            }
            resolve(row)
        })
    })
}

export default function hander(req, res){
    if(req.method === 'GET'){
        const { job_id } = req.query

        return getTheStatusOfJob(job_id).then((row) => {
            if(row){
                if(row.job_status === 'Done'){
                    res.status(200).json({
                        status : row.job_status,
                        qubo_solution : {
                            timing: {
                                solve_time: row.solve_time
                            }
                        }
                    })
                    return;
                }else{
                    res.status(200).json({
                        status : row.job_status,
                    })
                    return;
                }
            }else{
                res.status(404).json({message: `job_id ${job_id} IS Not Found`})
                return;
            }
        }).catch((err) => {
            console.log(err)
            res.status(500).json({message: "Internal Server Error"})
        })
        return;
    }else if (req.method === 'DELETE'){
        const { job_id } = req.query
        // check if the alive field is true, if it set it to be false
        const sql = `DELETE FROM jobs WHERE job_id = ?` 
        try{
            db.run(sql, [job_id], (err) => {
                if(err){
                    console.log(err)
                    res.status(500).json({message: "Internal Server Error"})
                }else{
                    res.status(200).json({message: `Delete Successfully`})
                }
            })
        }catch(err){
            console.log(err)
            res.status(500).json({message: "Internal Server Error"})
        }
        
        return;
    }
}