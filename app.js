const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const db = require("./configuration/config");
const multer = require("multer");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "/public")));

app.get("/", async (req, res) => {
  let table = "Employee_Basic_Information";
  let sql = `Select * from ${table}`;
  try {
    let [result] = await db.query(sql);
    res.status(200).render("../layout.ejs", {
      title: "Home",
      body: `home`,
      data: result,
    });
  } catch (err) {
    res.status(500);
  }
});

app.get("/add-employees", (req, res) => {
  res.render("../layout", { title: "Add Employees", body: "addEmployees" });

  res.render("./pages/addEmployees", { title: "Add Employees" });
});

app.get("/update-employee-information", (req, res) => {
  res.render("../layout", {
    title: "Update Employee Information",
    body: "updateEmployeeInfo",
  });
});

app.post("/add-employee", async (req, res) => {
  let {
    emp_name,
    contact_number,
    email,
    dob,
    profile,
    experience,
    last_salary,
    current_salary,
  } = req.body;
  let table = "Employee_Basic_Information";
  let sql = `insert into ${table} (emp_name,
      email,
      dob,
      profile,
      experience,
      last_salary,
      current_salary,
      contact_number) values (?,?,?,?,?,?,?,?)`;
  try {
    const [result] = await db.query(sql, [
      emp_name,
      email,
      dob,
      profile,
      experience,
      last_salary,
      current_salary,
      contact_number,
    ]);
    if (result.length != 0) {
      console.log(result);
      res.status(200).redirect("/view-employees");
    }
  } catch (err) {
    res.status(500).json({ message: err });
    console.log(err);
  }
});

app.get("/view-employees", async (req, res) => {
  let table = "Employee_Basic_Information";
  let sql = `Select * from ${table}`;
  try {
    let [result] = await db.query(sql);
    res.status(200).render("../layout.ejs", {
      title: "Employee List",
      body: `viewEmployees`,
      data: result,
    });
  } catch (err) {
    res.status(500);
  }
});

app.get("/update-employee-information/:emp_id", async (req, res) => {
  let id = req.params.emp_id;
  let table = "Employee_Basic_Information";
  let sql = `Select * from ${table} where emp_id=?`;
  try {
    let [result] = await db.query(sql, [id]);
    console.log("......", result);
    res.status(200).render("../layout", {
      title: "Update Employee Information",
      body: "updateEmployeeInfo",
      data: result[0],
    });
  } catch (err) {
    res.status(500).json({ message: err });
  }
});

app.post(
  "/update-employee-information/:emp_id",
  multer().none(),
  async (req, res) => {
    const id = req.params.emp_id;
    const updatedEmployeeInformation = req.body;
    console.log("BODY: ", updatedEmployeeInformation);
    // Filter out invalid values
    const updates = Object.entries(updatedEmployeeInformation).filter(
      ([key, value]) => value !== undefined && value !== null && value !== ""
    );

    if (updates.length === 0) {
      console.log("No updates provided.");
      return res
        .status(400)
        .json({ message: "No updates provided. Please provide valid data." });
    }

    const table = "Employee_Basic_Information";

    // Escape column names with backticks
    const setClause = updates.map(([key]) => `\`${key}\` = ?`).join(", ");
    const values = updates.map(([, value]) => value);

    const sql = `UPDATE ${table} SET ${setClause} WHERE emp_id = ?`;

    try {
      console.log("SQL Query:", sql, [...values, id]); // Log the query
      const [result] = await db.query(sql, [...values, id]);

      if (result.affectedRows > 0) {
        console.log("Update successful:", result);
        return res.status(200).redirect("/view-employees");
      } else {
        console.log("No changes made or employee not found.");
        return res
          .status(404)
          .json({ message: "Employee not found or no changes were applied." });
      }
    } catch (err) {
      console.error("Error updating employee:", err);
      return res.status(500).json({
        message:
          "Failed to update employee information. Please try again later.",
      });
    }
  }
);

app.delete("/delete-employee-information/:id", async (req, res) => {
  try {
    let id = req.params.id;
    console.log("ID: ", id);
    let table = "employee_basic_information";
    let sql = `DELETE FROM ${table} WHERE emp_id=?`;
    let [result] = await db.query(sql, id);
    if ((result.affectedRows = 1)) {
      return res.status(200).json({ message: "successfully deleted employee information." });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err });
  }
});

app.listen(3000, () => {
  console.log("website is running at port 3000");
});
