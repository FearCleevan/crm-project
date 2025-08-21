// server/controllers/permissionsController.js
import pool from "../config/db.js";

// Get all users with their permissions
export const getUsersWithPermissions = async (req, res) => {
  try {
    // Get all users with their direct role from crm-users table
    const [users] = await pool.query(`
            SELECT 
                user_id as id,
                first_name as firstName,
                last_name as lastName,
                email,
                username,
                profile,
                role as directRole,
                last_login as lastLogin
            FROM \`crm-users\`
            ORDER BY first_name, last_name
        `);

    console.log("Found users:", users);

    // Get additional roles from user_roles table and combine with direct role
    const usersWithPermissions = await Promise.all(
      users.map(async (user) => {
        try {
          // Get additional roles from user_roles table
          const [additionalRoles] = await pool.query(
            `
                        SELECT r.role_name 
                        FROM user_roles ur
                        JOIN permission_roles r ON ur.role_id = r.role_id
                        WHERE ur.user_id = ?
                    `,
            [user.id]
          );

          // Combine direct role with additional roles
          const allRoles = [];
          if (user.directRole) {
            allRoles.push(user.directRole);
          }
          additionalRoles.forEach((role) => {
            if (role.role_name && !allRoles.includes(role.role_name)) {
              allRoles.push(role.role_name);
            }
          });

          // Get permissions for all roles
          let allPermissions = [];
          for (const roleName of allRoles) {
            const [rolePermissions] = await pool.query(
              `
                            SELECT DISTINCT p.permission_key
                            FROM permission_roles r
                            JOIN role_permissions rp ON r.role_id = rp.role_id
                            JOIN permissions p ON rp.permission_id = p.permission_id
                            WHERE r.role_name = ? AND rp.has_permission = TRUE
                        `,
              [roleName]
            );

            rolePermissions.forEach((perm) => {
              if (
                perm.permission_key &&
                !allPermissions.includes(perm.permission_key)
              ) {
                allPermissions.push(perm.permission_key);
              }
            });
          }

          return {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            username: user.username,
            profile: user.profile,
            lastLogin: user.lastLogin,
            roles: allRoles,
            permissions: allPermissions,
          };
        } catch (error) {
          console.error(`Error processing user ${user.id}:`, error);
          return {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            username: user.username,
            profile: user.profile,
            lastLogin: user.lastLogin,
            roles: user.directRole ? [user.directRole] : [],
            permissions: [],
          };
        }
      })
    );

    console.log("Final users with permissions:", usersWithPermissions);

    res.json({
      success: true,
      users: usersWithPermissions,
    });
  } catch (error) {
    console.error("Get users with permissions error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get all available roles
export const getRoles = async (req, res) => {
  try {
    // Get roles from permission_roles table
    const [permissionRoles] = await pool.query(`
            SELECT 
                role_id as id,
                role_name as name,
                description,
                is_system_role as isSystemRole
            FROM permission_roles
            ORDER BY is_system_role DESC, role_name
        `);

    res.json({
      success: true,
      roles: permissionRoles,
    });
  } catch (error) {
    console.error("Get roles error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

// Get all available permissions
export const getPermissions = async (req, res) => {
  try {
    const [permissions] = await pool.query(`
            SELECT 
                p.permission_id as id,
                p.permission_name as name,
                p.permission_key as key,
                p.description,
                m.module_name as module,
                m.category
            FROM permissions p
            JOIN permission_modules m ON p.module_id = m.module_id
            ORDER BY m.category, m.module_name, p.permission_name
        `);

    res.json({
      success: true,
      permissions,
    });
  } catch (error) {
    console.error("Get permissions error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

// Update user roles
export const updateUserRoles = async (req, res) => {
  try {
    const { userId } = req.params;
    const { roleIds } = req.body;

    // Validate user exists
    const [userRows] = await pool.query(
      "SELECT user_id FROM `crm-users` WHERE user_id = ?",
      [userId]
    );

    if (userRows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Validate roles exist
    if (roleIds && roleIds.length > 0) {
      const placeholders = roleIds.map(() => "?").join(",");
      const [roleRows] = await pool.query(
        `SELECT role_id FROM permission_roles WHERE role_id IN (${placeholders})`,
        roleIds
      );

      if (roleRows.length !== roleIds.length) {
        return res.status(400).json({
          success: false,
          error: "One or more roles not found",
        });
      }
    }

    // Start transaction
    await pool.query("START TRANSACTION");

    try {
      // Remove existing roles
      await pool.query("DELETE FROM user_roles WHERE user_id = ?", [userId]);

      // Add new roles
      if (roleIds && roleIds.length > 0) {
        const values = roleIds.map((roleId) => [userId, roleId]);
        await pool.query("INSERT INTO user_roles (user_id, role_id) VALUES ?", [
          values,
        ]);
      }

      await pool.query("COMMIT");

      res.json({
        success: true,
        message: "User roles updated successfully",
      });
    } catch (error) {
      await pool.query("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("Update user roles error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

// Get user permissions for frontend validation
export const getUserPermissions = async (req, res) => {
  try {
    const userId = req.user.userId;

    const [permissions] = await pool.query(
      `
            SELECT DISTINCT p.permission_key as permissionKey
            FROM \`crm-users\` u
            JOIN user_roles ur ON u.user_id = ur.user_id
            JOIN role_permissions rp ON ur.role_id = rp.role_id
            JOIN permissions p ON rp.permission_id = p.permission_id
            WHERE u.user_id = ? AND rp.has_permission = TRUE
        `,
      [userId]
    );

    const permissionKeys = permissions.map((p) => p.permissionKey);

    res.json({
      success: true,
      permissions: permissionKeys,
    });
  } catch (error) {
    console.error("Get user permissions error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};