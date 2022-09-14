// @ts-nocheck

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  name: string;
};

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  // const login = async () => {
  //   try {
  //     const result = await axios.post(
  //       `http://localhost:4000/auth/login`,
  //       {
  //         email: 'mjudka@process-manager2.com.pl',
  //         password: 'aaa'
  //       },
  //       {
  //         withCredentials: true
  //         // headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' }
  //       }
  //     );

  //     console.log(result.data);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };
  // const getData = async () => {
  //   try {
  //     const res = await axios.get('http://localhost:4000/clients', {
  //       withCredentials: true
  //       // headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' }
  //     });

  //     console.log(res.data);
  //     return res.data;
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };
  // const x = login();
  // const data = getData();
  res.status(200).json([]);
}
