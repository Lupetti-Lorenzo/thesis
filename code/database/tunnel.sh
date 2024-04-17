#!/bin/bash
INSTANCE_ID=`aws ec2 describe-instances --filter Name=tag:Name,Values=dev-skill-manager-bastion-host-ec2 --query Reservations\[0\].Instances\[0\].InstanceId --output text`

aws ec2 start-instances --instance-ids $INSTANCE_ID

rds_secret=$(aws secretsmanager get-secret-value --secret-id DbAdminCredentials | jq '."SecretString" | fromjson')
rds_host=$(echo $rds_secret | jq -r .host); 
rds_port=$(echo $rds_secret | jq -r .port); 

aws ssm start-session \
--target $INSTANCE_ID \
--document-name AWS-StartPortForwardingSessionToRemoteHost \
--parameters host="$rds_host",portNumber="$rds_port",localPortNumber="$rds_port"