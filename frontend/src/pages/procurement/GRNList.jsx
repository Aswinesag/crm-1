import React,
{
  useEffect,
  useState,
} from "react";

import { Link } from "react-router-dom";

import GRNTable from "../../components/procurement/GRNTable";

import {
  getAllGRNs,
} from "../../services/grnService";

const GRNList = () => {
  const [grns, setGrns] =
    useState([]);

  const fetchGRNs =
    async () => {
      try {
        const res =
          await getAllGRNs();

        setGrns(res.data);
      } catch (error) {
        console.log(error);
      }
    };

  useEffect(() => {
    fetchGRNs();
  }, []);

  return (
    <div className="p-6">

      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">
          Goods Receipt Notes
        </h1>

        <Link
          to="/procurement/grns/create"
          className="btn btn-primary"
        >
          Create GRN
        </Link>
      </div>

      <div className="grid md:grid-cols-4 gap-4 mb-6">

        <div className="stat bg-base-100 rounded-xl shadow">
          <div className="stat-title">
            Total GRNs
          </div>
          <div className="stat-value">
            {grns.length}
          </div>
        </div>

        <div className="stat bg-base-100 rounded-xl shadow">
          <div className="stat-title">
            Posted
          </div>
          <div className="stat-value">
            {
              grns.filter(
                (g) =>
                  g.status ===
                  "Posted"
              ).length
            }
          </div>
        </div>

      </div>

      <GRNTable grns={grns} />
    </div>
  );
};

export default GRNList;
