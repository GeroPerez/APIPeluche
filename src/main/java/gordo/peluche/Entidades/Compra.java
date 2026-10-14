package gordo.peluche.Entidades;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
public class Compra {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private int iva;
    private float subtotal;
    private float total;

    @ManyToMany
    @JoinTable(name = "compra_productos", joinColumns = @JoinColumn(name = "compra_id"), inverseJoinColumns = @JoinColumn(name = "producto_id"))
    private List<Producto> productos;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "Cliente_id")
    private Cliente cliente;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "factura_id", referencedColumnName = "id")
    private Factura factura;

    public Compra(Long id, int iva, float subtotal, float total, List<Producto> productos, Cliente cliente,
            Factura factura) {
        this.id = id;
        this.iva = iva;
        this.subtotal = subtotal;
        this.total = total;
        this.productos = productos;
        this.cliente = cliente;
        this.factura = factura;
    }

    public Compra() {
    }
    
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public int getIva() {
        return iva;
    }

    public void setIva(int iva) {
        this.iva = iva;
    }

    public float getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(float subtotal) {
        this.subtotal = subtotal;
    }

    public float getTotal() {
        return total;
    }

    public void setTotal(float total) {
        this.total = total;
    }

    public List<Producto> getProductos() {
        return productos;
    }

    public void setProductos(List<Producto> productos) {
        this.productos = productos;
    }

    public Cliente getCliente() {
        return cliente;
    }

    public void setCliente(Cliente cliente) {
        this.cliente = cliente;
    }

    public Factura getFactura() {
        return factura;
    }

    public void setFactura(Factura factura) {
        this.factura = factura;
    }


}
