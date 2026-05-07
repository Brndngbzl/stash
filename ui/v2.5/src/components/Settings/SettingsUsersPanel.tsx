import React, { useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Form,
  Table,
} from "react-bootstrap";
import { FormattedMessage, useIntl } from "react-intl";
import {
  faEdit,
  faKey,
  faPlus,
  faTrashAlt,
  faUser,
  faUserShield,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { Icon } from "../Shared/Icon";
import { ModalComponent } from "../Shared/Modal";
import { SettingSection } from "./SettingSection";
import { useToast } from "src/hooks/Toast";

// ---------------------------------------------------------------------------
// Types – will be replaced with generated GraphQL types once the backend
// implements the User/Sharing API (see graphql/schema/types/user.graphql).
// ---------------------------------------------------------------------------

export type UserRole = "ADMIN" | "MODERATOR" | "USER";

export interface IUser {
  id: string;
  username: string;
  role: UserRole;
  createdAt: string;
  lastLoginAt?: string | null;
}

type ModalMode = "create" | "edit" | "delete" | "reset-password" | null;

// Minimum password length enforced on the client to reduce weak-credential risk.
const MIN_PASSWORD_LENGTH = 8;

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface IRoleBadge {
  role: UserRole;
}

const RoleBadge: React.FC<IRoleBadge> = ({ role }) => {
  const intl = useIntl();
  const variantMap: Record<UserRole, string> = {
    ADMIN: "danger",
    MODERATOR: "warning",
    USER: "secondary",
  };
  const labelMap: Record<UserRole, string> = {
    ADMIN: intl.formatMessage({ id: "config.users.roles.admin" }),
    MODERATOR: intl.formatMessage({ id: "config.users.roles.moderator" }),
    USER: intl.formatMessage({ id: "config.users.roles.user" }),
  };
  return <Badge variant={variantMap[role]}>{labelMap[role]}</Badge>;
};

interface ICreateUserModal {
  show: boolean;
  onClose: () => void;
  onCreate: (username: string, password: string, role: UserRole) => void;
}

const CreateUserModal: React.FC<ICreateUserModal> = ({
  show,
  onClose,
  onCreate,
}) => {
  const intl = useIntl();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<UserRole>("USER");
  const [validationError, setValidationError] = useState<string | null>(null);

  function reset() {
    setUsername("");
    setPassword("");
    setConfirmPassword("");
    setRole("USER");
    setValidationError(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function validate(): boolean {
    if (!username.trim()) {
      setValidationError(
        intl.formatMessage({ id: "config.users.validation.username_required" })
      );
      return false;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setValidationError(
        intl.formatMessage(
          { id: "config.users.validation.password_too_short" },
          { minLength: MIN_PASSWORD_LENGTH }
        )
      );
      return false;
    }
    if (password !== confirmPassword) {
      setValidationError(
        intl.formatMessage({ id: "config.users.validation.passwords_mismatch" })
      );
      return false;
    }
    return true;
  }

  function handleCreate() {
    if (!validate()) return;
    onCreate(username.trim(), password, role);
    reset();
  }

  return (
    <ModalComponent
      show={show}
      onHide={handleClose}
      icon={faUser}
      header={intl.formatMessage({ id: "config.users.create_user" })}
      accept={{
        text: intl.formatMessage({ id: "actions.create" }),
        variant: "primary",
        onClick: handleCreate,
      }}
      cancel={{
        onClick: handleClose,
        variant: "secondary",
      }}
    >
      {validationError && (
        <Alert variant="danger" onClose={() => setValidationError(null)} dismissible>
          {validationError}
        </Alert>
      )}
      <Form.Group controlId="create-username">
        <Form.Label>
          <FormattedMessage id="config.users.username" />
        </Form.Label>
        <Form.Control
          className="text-input"
          type="text"
          autoComplete="username"
          value={username}
          maxLength={64}
          onChange={(e) => setUsername(e.currentTarget.value)}
        />
      </Form.Group>
      <Form.Group controlId="create-password">
        <Form.Label>
          <FormattedMessage id="config.users.password" />
        </Form.Label>
        <Form.Control
          className="text-input"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.currentTarget.value)}
        />
        <Form.Text className="text-muted">
          <FormattedMessage
            id="config.users.password_requirements"
            values={{ minLength: MIN_PASSWORD_LENGTH }}
          />
        </Form.Text>
      </Form.Group>
      <Form.Group controlId="create-confirm-password">
        <Form.Label>
          <FormattedMessage id="config.users.confirm_password" />
        </Form.Label>
        <Form.Control
          className="text-input"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.currentTarget.value)}
        />
      </Form.Group>
      <Form.Group controlId="create-role">
        <Form.Label>
          <FormattedMessage id="config.users.role" />
        </Form.Label>
        <Form.Control
          as="select"
          className="btn-secondary"
          value={role}
          onChange={(e) => setRole(e.currentTarget.value as UserRole)}
        >
          <option value="USER">
            {intl.formatMessage({ id: "config.users.roles.user" })}
          </option>
          <option value="MODERATOR">
            {intl.formatMessage({ id: "config.users.roles.moderator" })}
          </option>
          <option value="ADMIN">
            {intl.formatMessage({ id: "config.users.roles.admin" })}
          </option>
        </Form.Control>
      </Form.Group>
    </ModalComponent>
  );
};

interface IEditUserModal {
  user: IUser | null;
  onClose: () => void;
  onEdit: (id: string, role: UserRole) => void;
}

const EditUserModal: React.FC<IEditUserModal> = ({ user, onClose, onEdit }) => {
  const intl = useIntl();
  const [role, setRole] = useState<UserRole>(user?.role ?? "USER");

  // Sync role when the user prop changes (different user selected).
  React.useEffect(() => {
    if (user) setRole(user.role);
  }, [user]);

  return (
    <ModalComponent
      show={user !== null}
      onHide={onClose}
      icon={faEdit}
      header={intl.formatMessage(
        { id: "config.users.edit_user" },
        { username: user?.username ?? "" }
      )}
      accept={{
        text: intl.formatMessage({ id: "actions.save" }),
        variant: "primary",
        onClick: () => {
          if (user) onEdit(user.id, role);
        },
      }}
      cancel={{
        onClick: onClose,
        variant: "secondary",
      }}
    >
      <Form.Group controlId="edit-role">
        <Form.Label>
          <FormattedMessage id="config.users.role" />
        </Form.Label>
        <Form.Control
          as="select"
          className="btn-secondary"
          value={role}
          onChange={(e) => setRole(e.currentTarget.value as UserRole)}
        >
          <option value="USER">
            {intl.formatMessage({ id: "config.users.roles.user" })}
          </option>
          <option value="MODERATOR">
            {intl.formatMessage({ id: "config.users.roles.moderator" })}
          </option>
          <option value="ADMIN">
            {intl.formatMessage({ id: "config.users.roles.admin" })}
          </option>
        </Form.Control>
      </Form.Group>
    </ModalComponent>
  );
};

interface IDeleteUserModal {
  user: IUser | null;
  onClose: () => void;
  onDelete: (id: string) => void;
}

const DeleteUserModal: React.FC<IDeleteUserModal> = ({
  user,
  onClose,
  onDelete,
}) => {
  const intl = useIntl();

  return (
    <ModalComponent
      show={user !== null}
      onHide={onClose}
      icon={faTrashAlt}
      header={intl.formatMessage({ id: "config.users.delete_user" })}
      accept={{
        text: intl.formatMessage({ id: "actions.delete" }),
        variant: "danger",
        onClick: () => {
          if (user) onDelete(user.id);
        },
      }}
      cancel={{
        onClick: onClose,
        variant: "secondary",
      }}
    >
      <p>
        <FormattedMessage
          id="config.users.delete_confirm"
          values={{ username: <strong>{user?.username}</strong> }}
        />
      </p>
    </ModalComponent>
  );
};

// ---------------------------------------------------------------------------
// Main panel
// ---------------------------------------------------------------------------

export const SettingsUsersPanel: React.FC = () => {
  const intl = useIntl();
  const Toast = useToast();

  // TODO: Replace mock state with GraphQL query (FindUsers) once the backend
  // implements the User API. See graphql/schema/types/user.graphql.
  const [users, setUsers] = useState<IUser[]>([]);

  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);

  // ----- Handlers -----------------------------------------------------------

  function handleCreate(username: string, password: string, role: UserRole) {
    // TODO: call userCreate mutation and refresh list.
    const newUser: IUser = {
      id: String(Date.now()),
      username,
      role,
      createdAt: new Date().toISOString(),
      lastLoginAt: null,
    };
    setUsers((prev) => [...prev, newUser]);
    setModalMode(null);
    Toast.success(
      intl.formatMessage({ id: "config.users.toast.user_created" })
    );
  }

  function handleEdit(id: string, role: UserRole) {
    // TODO: call userUpdate mutation and refresh list.
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, role } : u))
    );
    setSelectedUser(null);
    setModalMode(null);
    Toast.success(
      intl.formatMessage({ id: "config.users.toast.user_updated" })
    );
  }

  function handleDelete(id: string) {
    // TODO: call userDelete mutation and refresh list.
    setUsers((prev) => prev.filter((u) => u.id !== id));
    setSelectedUser(null);
    setModalMode(null);
    Toast.success(
      intl.formatMessage({ id: "config.users.toast.user_deleted" })
    );
  }

  function openEdit(user: IUser) {
    setSelectedUser(user);
    setModalMode("edit");
  }

  function openDelete(user: IUser) {
    setSelectedUser(user);
    setModalMode("delete");
  }

  function closeModal() {
    setSelectedUser(null);
    setModalMode(null);
  }

  function formatDate(iso?: string | null) {
    if (!iso) return "—";
    return intl.formatDate(iso, { dateStyle: "medium" });
  }

  // ----- Render helpers -----------------------------------------------------

  function renderUserRow(user: IUser) {
    return (
      <tr key={user.id}>
        <td>
          <Icon icon={faUser} className="mr-2" />
          {user.username}
        </td>
        <td>
          <RoleBadge role={user.role} />
        </td>
        <td>{formatDate(user.createdAt)}</td>
        <td>{formatDate(user.lastLoginAt)}</td>
        <td className="text-right">
          <Button
            className="mr-1"
            size="sm"
            variant="secondary"
            title={intl.formatMessage({ id: "actions.edit" })}
            onClick={() => openEdit(user)}
          >
            <Icon icon={faEdit} />
          </Button>
          <Button
            size="sm"
            variant="danger"
            title={intl.formatMessage({ id: "actions.delete" })}
            onClick={() => openDelete(user)}
          >
            <Icon icon={faTrashAlt} />
          </Button>
        </td>
      </tr>
    );
  }

  function renderTable() {
    if (users.length === 0) {
      return (
        <Alert variant="info">
          <FormattedMessage id="config.users.no_users" />
        </Alert>
      );
    }

    return (
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>
              <FormattedMessage id="config.users.username" />
            </th>
            <th>
              <FormattedMessage id="config.users.role" />
            </th>
            <th>
              <FormattedMessage id="config.users.created_at" />
            </th>
            <th>
              <FormattedMessage id="config.users.last_login" />
            </th>
            <th />
          </tr>
        </thead>
        <tbody>{users.map(renderUserRow)}</tbody>
      </Table>
    );
  }

  return (
    <div id="settings-users">
      {/* Modals */}
      <CreateUserModal
        show={modalMode === "create"}
        onClose={closeModal}
        onCreate={handleCreate}
      />
      <EditUserModal
        user={modalMode === "edit" ? selectedUser : null}
        onClose={closeModal}
        onEdit={handleEdit}
      />
      <DeleteUserModal
        user={modalMode === "delete" ? selectedUser : null}
        onClose={closeModal}
        onDelete={handleDelete}
      />

      <SettingSection headingID="config.users.heading">
        <div className="setting-group">
          <div className="setting">
            <div>
              <h3>
                <Icon icon={faUsers} className="mr-2" />
                <FormattedMessage id="config.users.manage_users" />
              </h3>
              <div className="sub-heading">
                <FormattedMessage id="config.users.manage_users_desc" />
              </div>
            </div>
            <div>
              <Button
                variant="primary"
                onClick={() => setModalMode("create")}
              >
                <Icon icon={faPlus} className="mr-2" />
                <FormattedMessage id="config.users.create_user" />
              </Button>
            </div>
          </div>
          <div className="content">{renderTable()}</div>
        </div>
      </SettingSection>

      <SettingSection headingID="config.users.roles_heading">
        <div className="setting-group">
          <div className="setting">
            <div>
              <h3>
                <Icon icon={faUserShield} className="mr-2" />
                <FormattedMessage id="config.users.roles.admin" />
              </h3>
              <div className="sub-heading">
                <FormattedMessage id="config.users.roles.admin_desc" />
              </div>
            </div>
          </div>
          <div className="setting">
            <div>
              <h3>
                <Icon icon={faKey} className="mr-2" />
                <FormattedMessage id="config.users.roles.moderator" />
              </h3>
              <div className="sub-heading">
                <FormattedMessage id="config.users.roles.moderator_desc" />
              </div>
            </div>
          </div>
          <div className="setting">
            <div>
              <h3>
                <Icon icon={faUser} className="mr-2" />
                <FormattedMessage id="config.users.roles.user" />
              </h3>
              <div className="sub-heading">
                <FormattedMessage id="config.users.roles.user_desc" />
              </div>
            </div>
          </div>
        </div>
      </SettingSection>
    </div>
  );
};
