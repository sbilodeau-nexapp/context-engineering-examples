import * as gitlab from '@pulumi/gitlab';
import { Input } from '@pulumi/pulumi';

import { CiUser } from './common/ci-user';
import { Api } from './components/api';
import { StaticWebApplication } from './components/static-web-application';

interface BackendArgs {
  api: Api;
  componentNamePrefix: string;
  stackName: string;
  isVariableProtected: boolean;
  gitlabProjectId: Input<string>;
}

export const registerDeferredBackendGitlabVariables = (args: BackendArgs) => {
  const sharedVariablesInput = {
    project: args.gitlabProjectId,
    protected: args.isVariableProtected,
    environmentScope: `${args.stackName}/backend`,
    description: 'managed with pulumi',
  };

  //TODO need to validate if it's ok outside of being deferred now that I have created
  // An explicit task definition
  // args.api.taskDefinitionName.apply((task) => {
  //   if (task) {
  //     new gitlab.ProjectVariable(
  //       `${args.componentNamePrefix}-gitlab-variable-ecs-task-definition-name`,
  //       {
  //         ...sharedVariablesInput,
  //         key: 'ECS_TASK_DEFINITION_NAME',
  //         value: task,
  //       },
  //     );
  //   }
  // });

  args.api.serviceName.apply((name: string) => {
    if (name) {
      new gitlab.ProjectVariable(
        `${args.componentNamePrefix}-gitlab-variable-ecs-service-name`,
        {
          ...sharedVariablesInput,
          key: 'ECS_SERVICE_NAME',
          value: args.api.serviceName,
        },
      );
    }
  });
};
