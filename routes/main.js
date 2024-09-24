import authRoute from './authRoute.js'

import {Router} from 'express'; 
const router = Router(); 

router.use('/api', authRoute)

export default router