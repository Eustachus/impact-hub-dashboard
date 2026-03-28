
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 6.2.1
 * Query Engine version: 4123509d24aa4dede1e864b46351bf2790323b69
 */
Prisma.prismaVersion = {
  client: "6.2.1",
  engine: "4123509d24aa4dede1e864b46351bf2790323b69"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  Serializable: 'Serializable'
});

exports.Prisma.AccountScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  type: 'type',
  provider: 'provider',
  providerAccountId: 'providerAccountId',
  refresh_token: 'refresh_token',
  access_token: 'access_token',
  expires_at: 'expires_at',
  token_type: 'token_type',
  scope: 'scope',
  id_token: 'id_token',
  session_state: 'session_state'
};

exports.Prisma.SessionScalarFieldEnum = {
  id: 'id',
  sessionToken: 'sessionToken',
  userId: 'userId',
  expires: 'expires'
};

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  name: 'name',
  email: 'email',
  emailVerified: 'emailVerified',
  image: 'image',
  bio: 'bio',
  timezone: 'timezone',
  language: 'language',
  theme: 'theme',
  twoFactorEnabled: 'twoFactorEnabled',
  twoFactorSecret: 'twoFactorSecret',
  productivityPoints: 'productivityPoints',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.VerificationTokenScalarFieldEnum = {
  identifier: 'identifier',
  token: 'token',
  expires: 'expires'
};

exports.Prisma.WorkspaceScalarFieldEnum = {
  id: 'id',
  name: 'name',
  logo: 'logo',
  domain: 'domain',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.WorkspaceMemberScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  workspaceId: 'workspaceId',
  role: 'role'
};

exports.Prisma.TeamScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  icon: 'icon',
  color: 'color',
  workspaceId: 'workspaceId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TeamMemberScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  teamId: 'teamId',
  role: 'role'
};

exports.Prisma.PortfolioScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  workspaceId: 'workspaceId',
  teamId: 'teamId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ProjectScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  color: 'color',
  icon: 'icon',
  status: 'status',
  startDate: 'startDate',
  dueDate: 'dueDate',
  isPublic: 'isPublic',
  brief: 'brief',
  isTemplate: 'isTemplate',
  workspaceId: 'workspaceId',
  teamId: 'teamId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ProjectResourceScalarFieldEnum = {
  id: 'id',
  title: 'title',
  url: 'url',
  type: 'type',
  projectId: 'projectId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PortfolioProjectScalarFieldEnum = {
  id: 'id',
  portfolioId: 'portfolioId',
  projectId: 'projectId'
};

exports.Prisma.ProjectMemberScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  projectId: 'projectId',
  role: 'role',
  notificationPrefs: 'notificationPrefs'
};

exports.Prisma.SectionScalarFieldEnum = {
  id: 'id',
  name: 'name',
  order: 'order',
  projectId: 'projectId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TaskScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  priority: 'priority',
  status: 'status',
  startDate: 'startDate',
  dueDate: 'dueDate',
  completed: 'completed',
  completedAt: 'completedAt',
  effort: 'effort',
  order: 'order',
  projectId: 'projectId',
  sectionId: 'sectionId',
  creatorId: 'creatorId',
  parentId: 'parentId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TaskAssigneeScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  taskId: 'taskId'
};

exports.Prisma.TaskDependencyScalarFieldEnum = {
  id: 'id',
  blockingId: 'blockingId',
  blockedById: 'blockedById'
};

exports.Prisma.CustomFieldScalarFieldEnum = {
  id: 'id',
  name: 'name',
  type: 'type',
  options: 'options',
  projectId: 'projectId'
};

exports.Prisma.CustomFieldValueScalarFieldEnum = {
  id: 'id',
  value: 'value',
  taskId: 'taskId',
  customFieldId: 'customFieldId'
};

exports.Prisma.TagScalarFieldEnum = {
  id: 'id',
  name: 'name',
  color: 'color',
  workspaceId: 'workspaceId'
};

exports.Prisma.TaskTagScalarFieldEnum = {
  id: 'id',
  taskId: 'taskId',
  tagId: 'tagId'
};

exports.Prisma.GoalScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  status: 'status',
  targetDate: 'targetDate',
  period: 'period',
  workspaceId: 'workspaceId',
  teamId: 'teamId',
  ownerId: 'ownerId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.KeyResultScalarFieldEnum = {
  id: 'id',
  title: 'title',
  type: 'type',
  currentValue: 'currentValue',
  targetValue: 'targetValue',
  unit: 'unit',
  goalId: 'goalId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AttachmentScalarFieldEnum = {
  id: 'id',
  name: 'name',
  url: 'url',
  size: 'size',
  type: 'type',
  taskId: 'taskId',
  createdAt: 'createdAt'
};

exports.Prisma.CommentScalarFieldEnum = {
  id: 'id',
  content: 'content',
  taskId: 'taskId',
  userId: 'userId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ActivityLogScalarFieldEnum = {
  id: 'id',
  action: 'action',
  entityType: 'entityType',
  entityId: 'entityId',
  details: 'details',
  userId: 'userId',
  taskId: 'taskId',
  createdAt: 'createdAt'
};

exports.Prisma.TimeEntryScalarFieldEnum = {
  id: 'id',
  duration: 'duration',
  description: 'description',
  date: 'date',
  taskId: 'taskId',
  userId: 'userId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.EmailMessageScalarFieldEnum = {
  id: 'id',
  messageId: 'messageId',
  threadId: 'threadId',
  subject: 'subject',
  snippet: 'snippet',
  sender: 'sender',
  date: 'date',
  read: 'read',
  labels: 'labels',
  userId: 'userId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};


exports.Prisma.ModelName = {
  Account: 'Account',
  Session: 'Session',
  User: 'User',
  VerificationToken: 'VerificationToken',
  Workspace: 'Workspace',
  WorkspaceMember: 'WorkspaceMember',
  Team: 'Team',
  TeamMember: 'TeamMember',
  Portfolio: 'Portfolio',
  Project: 'Project',
  ProjectResource: 'ProjectResource',
  PortfolioProject: 'PortfolioProject',
  ProjectMember: 'ProjectMember',
  Section: 'Section',
  Task: 'Task',
  TaskAssignee: 'TaskAssignee',
  TaskDependency: 'TaskDependency',
  CustomField: 'CustomField',
  CustomFieldValue: 'CustomFieldValue',
  Tag: 'Tag',
  TaskTag: 'TaskTag',
  Goal: 'Goal',
  KeyResult: 'KeyResult',
  Attachment: 'Attachment',
  Comment: 'Comment',
  ActivityLog: 'ActivityLog',
  TimeEntry: 'TimeEntry',
  EmailMessage: 'EmailMessage'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
