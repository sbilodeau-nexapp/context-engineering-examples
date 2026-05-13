import * as gitlab from '@pulumi/gitlab';
import { Input } from '@pulumi/pulumi';

interface Args {
  isVariableProtected: boolean;
  gitlabProjectId: Input<string>;
  environmentScope: string;
  variables: {
    componentName: string;
    key: string;
    value: Input<string>;
    masked?: boolean;
  }[];
}

export const registerGitlabVariables = (args: Args) => {
  const sharedVariablesInput = {
    project: args.gitlabProjectId,
    protected: args.isVariableProtected,
    environmentScope: args.environmentScope,
    description: 'managed with pulumi',
  };

  args.variables.forEach((variable) => {
    new gitlab.ProjectVariable(variable.componentName, {
      ...sharedVariablesInput,
      key: variable.key,
      value: variable.value,
      masked: variable.masked ?? true,
    });
  });
};
