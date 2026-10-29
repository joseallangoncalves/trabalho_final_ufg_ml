"""
Servidor FastAPI para Predição de Aditivos Contratuais (Petrobras).
Disciplina de Aprendizado de Máquina - Prof. Dr. Ronaldo Martins da Costa (UFG).
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
import sys

# Inclusão do diretório de backend e src/ml no sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "src", "ml"))

from schemas import ContractInputSchema, PredictionResponseSchema, ClusterResponseSchema
from predictor import predictor

app = FastAPI(
    title="Petrobras ML - Predição de Aditivos Contratuais",
    description="API RESTful de inferência de Machine Learning desenvolvida sob os guardrails metodológicos do Prof. Dr. Ronaldo Martins da Costa (UFG).",
    version="3.0.0",
)

# Configuração de CORS para comunicação transparente com o frontend React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {
        "status": "online",
        "servico": "Petrobras Contract Addendum ML API",
        "modelo_campeao": predictor.metrics_report.get("modelo_campeao", "Random Forest (Abordagem 4)"),
        "versao_api": "v3.0.0",
        "limiar_ks": predictor.limiar_ks,
        "max_ks": predictor.max_ks,
    }


@app.post("/api/predict", response_model=PredictionResponseSchema)
def predict_contract(contract: ContractInputSchema):
    """Pilar 1: Classificação Supervisionada com Random Forest Abordagem 4 e corte KS."""
    try:
        return predictor.predict(contract)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro na inferência: {str(e)}")


@app.post("/api/predict-cluster", response_model=ClusterResponseSchema)
@app.post("/api/cluster", response_model=ClusterResponseSchema)
def predict_contract_cluster(contract: ContractInputSchema):
    """Pilar 2: Agrupamento/Clusterização K-Means Cenário 1 com MinMaxScaler (k=3)."""
    try:
        return predictor.get_cluster(contract)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro na clusterização: {str(e)}")


@app.get("/api/cluster-report")
def get_cluster_report():
    """Retorna os dados estatísticos consolidados dos 3 clusters do Cenário 1."""
    return predictor.cluster_report


@app.get("/api/trabalho-report")
def get_trabalho_report():
    """Retorna os dados consolidados dos pilares supervisionado e não supervisionado."""
    return predictor.trabalho_report


@app.get("/api/metrics")
def get_metrics():
    return predictor.metrics_report


@app.get("/api/feature-importance")
def get_feature_importance():
    return predictor.feature_importance


@app.get("/api/contract-options")
def get_contract_options():
    return predictor.contract_options


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
