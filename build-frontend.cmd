@echo off
chcp 65001
cd frontend
echo ==================Yarn Build Start==================
call  yarn build
echo ===================Yarn Build End===================
cd ..
robocopy frontend\dist web /MIR /NJH  /NJS /NP
echo done